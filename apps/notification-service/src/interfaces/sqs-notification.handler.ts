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
    const tableName = this.configService.get<string>('IDEMPOTENCY_TABLE');
    if (!tableName) {
      throw new Error('Variável de ambiente obrigatória ausente: IDEMPOTENCY_TABLE');
    }
    this.idempotency = new IdempotencyStore(tableName);
  }

  async handle(event: SQSEvent): Promise<SQSBatchResponse> {
    const failures: { itemIdentifier: string }[] = [];

    await Promise.all(
      event.Records.map(async (record) => {
        try {
          const msg = JSON.parse(record.body) as NotificationMessage;

          if (await this.idempotency.check(msg.id)) {
            CommonLogger.info('NotificationHandler', 'SKIP_DUPLICATE', { id: msg.id, type: msg.type }, record.messageId);
            return;
          }

          switch (msg.type) {
            case 'verification': {
              const payload = msg.payload as VerificationEmailPayload;
              await this.verificationUseCase.execute(payload);
              break;
            }
            case 'account_created': {
              const payload = msg.payload as AccountCreatedPayload;
              await this.accountCreatedUseCase.execute(payload);
              break;
            }
            case 'password_recovery': {
              const payload = msg.payload as PasswordRecoveryPayload;
              await this.passwordRecoveryUseCase.execute(payload);
              break;
            }
            case 'public_data_access': {
              const payload = msg.payload as PublicDataAccessPayload;
              await this.publicDataAccessUseCase.execute(payload);
              break;
            }
            default:
              throw new Error(`Unknown notification type.`);
          }

          await this.idempotency.markProcessed(msg.id, msg.type, msg.version, msg.payload);

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
