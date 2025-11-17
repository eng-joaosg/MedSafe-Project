import { Inject, Injectable } from '@nestjs/common';
import type { IMailerService } from '../services/i-mailer.service';
import { BaseUseCase } from './base.usecase';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../templates/email.template';

export interface AccountCreatedPayload {
  email: string;
  name: string;
}

@Injectable()
export class SendAccountCreatedEmailUseCase extends BaseUseCase {
  constructor(
    @Inject('IMailerService')
    private readonly mailer: IMailerService,
  ) {
    super(SendAccountCreatedEmailUseCase.name);
  }

  public async execute(payload: AccountCreatedPayload): Promise<void> {
    const { email, name } = payload;

    this.logger.log(
      JSON.stringify({
        action: 'SEND_ACCOUNT_CREATED_EMAIL',
        status: 'start',
        email,
      }),
    );

    const subject = 'Conta criada com sucesso';
    const html = EmailTemplates.accountCreated(name);

    try {
      await this.mailer.sendEmail(email, subject, html);

      this.logger.log(
        JSON.stringify({
          action: 'SEND_ACCOUNT_CREATED_EMAIL',
          status: 'success',
          email,
        }),
      );
    } catch (error) {
      if (error instanceof EmailDeliveryException) {
        this.logger.error(
          JSON.stringify({
            action: 'SEND_ACCOUNT_CREATED_EMAIL',
            status: 'controlled_failure',
            email,
            message: error.message,
          }),
        );
        throw error;
      }

      this.logger.error(
        JSON.stringify({
          action: 'SEND_ACCOUNT_CREATED_EMAIL',
          status: 'unexpected_failure',
          email,
          message: error.message,
          stack: error.stack,
        }),
      );
      throw new ExternalServiceException('IMailerService', error instanceof Error ? error.message : String(error));
    }
  }
}
