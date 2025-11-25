import { Inject, Injectable } from '@nestjs/common';
import type { IMailerService } from '../services/i-mailer.service';
import { BaseUseCase } from './base.usecase';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EMAIL_TEMPLATES, MAILER_SERVICE } from '../../common/constants/token.constants';
import type { IEmailTemplates } from '../contracts/i-email-templates';

export interface PublicDataAccessPayload {
  email: string;
  name: string;
  accessedAt: Date;
}

@Injectable()
export class SendPublicDataAccessAlertEmailUseCase extends BaseUseCase {
  constructor(
    @Inject(MAILER_SERVICE)
    private readonly mailer: IMailerService,
    @Inject(EMAIL_TEMPLATES)
    private readonly emailTemplates: IEmailTemplates,
  ) {
    super(SendPublicDataAccessAlertEmailUseCase.name);
  }

  public async execute(payload: PublicDataAccessPayload): Promise<void> {
    const { email, name, accessedAt } = payload;

    this.logger.log(
      JSON.stringify({
        action: 'SEND_PUBLIC_DATA_ACCESS_ALERT',
        status: 'start',
        email,
      }),
    );

    const subject = 'Aviso de acesso aos seus dados públicos';
    const html = this.emailTemplates.publicDataAccess(name, accessedAt);

    try {
      await this.mailer.sendEmail(email, subject, html);

      this.logger.log(
        JSON.stringify({
          action: 'SEND_PUBLIC_DATA_ACCESS_ALERT',
          status: 'success',
          email,
        }),
      );
    } catch (error) {
      if (error instanceof EmailDeliveryException) {
        this.logger.error(
          JSON.stringify({
            action: 'SEND_PUBLIC_DATA_ACCESS_ALERT',
            status: 'controlled_failure',
            email,
            message: error.message,
          }),
        );
        throw error;
      }

      this.logger.error(
        JSON.stringify({
          action: 'SEND_PUBLIC_DATA_ACCESS_ALERT',
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
