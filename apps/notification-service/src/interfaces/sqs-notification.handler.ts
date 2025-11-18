import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountCreatedPayload, SendAccountCreatedEmailUseCase } from '../application/usecases/send-account-created-email.usecase';
import { IdempotencyStore } from '../infrastructure/persistence/indepotency_store';
import { CommonLogger } from '../common/logger/common.logger';
import { PasswordRecoveryPayload, SendPasswordRecoveryEmailUseCase } from '../application/usecases/send-password-recovery-email.usecase';
import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { SendVerificationEmailUseCase, VerificationEmailPayload } from '../application/usecases/send-verification-email.usecase';
import {
  SendPublicDataAccessAlertEmailUseCase,
  PublicDataAccessPayload,
} from '../application/usecases/send-public-data-access-alert-email.usecase';

interface NotificationMessage {
  id: string;
  type: 'verification' | 'account_created' | 'password_recovery' | 'public_data_access';
  version: number;
  payload: any;
}

@Injectable()
export class NotificationHandler {
  private readonly idempotency: IdempotencyStore;

  constructor(
    private readonly configService: ConfigService,
    private readonly verificationUseCase: SendVerificationEmailUseCase,
    private readonly accountCreatedUseCase: SendAccountCreatedEmailUseCase,
    private readonly passwordRecoveryUseCase: SendPasswordRecoveryEmailUseCase,
    private readonly publicDataAccessUseCase: SendPublicDataAccessAlertEmailUseCase,
  ) {
    const tableName = this.configService.get<string>('DYNAMO_TABLE_NAME');
    if (!tableName) {
      throw new Error('Variável de ambiente obrigatória ausente: DYNAMO_TABLE_NAME');
    }
    this.idempotency = new IdempotencyStore(tableName, this.configService);
  }

  async handle(event: SQSEvent): Promise<SQSBatchResponse> {
    const failures: { itemIdentifier: string }[] = [];

    await Promise.all(
      event.Records.map(async (record) => {
        let msg: NotificationMessage | null = null;
        try {
          msg = JSON.parse(record.body) as NotificationMessage;

          if (await this.idempotency.check(msg.id)) {
            CommonLogger.info('NotificationHandler', 'SKIP_DUPLICATE', { id: msg.id, type: msg.type }, record.messageId);
            return;
          }
          await this.idempotency.markProcessing(msg.id, msg.type, msg.version, msg.payload);

          switch (msg.type) {
            case 'verification':
              await this.verificationUseCase.execute(msg.payload as VerificationEmailPayload);
              break;
            case 'account_created':
              await this.accountCreatedUseCase.execute(msg.payload as AccountCreatedPayload);
              break;
            case 'password_recovery':
              await this.passwordRecoveryUseCase.execute(msg.payload as PasswordRecoveryPayload);
              break;
            case 'public_data_access':
              await this.publicDataAccessUseCase.execute(msg.payload as PublicDataAccessPayload);
              break;
            default:
              throw new Error(`Unknown notification type.`);
          }

          await this.idempotency.markProcessed(msg.id);

          CommonLogger.info('NotificationHandler', 'SUCCESS', { id: msg.id, type: msg.type }, record.messageId);
        } catch (err: any) {
          CommonLogger.error('NotificationHandler', 'FAILURE', { error: err.message, stack: err.stack }, err, record.messageId);
          failures.push({ itemIdentifier: record.messageId });
        }
      }),
    );

    return { batchItemFailures: failures };
  }
}
