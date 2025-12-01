import { Inject, Injectable } from '@nestjs/common';
import type { IMailerService } from '../services/i-mailer.service';
import { BaseUseCase } from './base.usecase';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EMAIL_TEMPLATES, MAILER_SERVICE } from '../../common/constants/token.constants';
import type { IEmailTemplates } from '../contracts/i-email-templates';

export interface PasswordRecoveryPayload {
  email: string;
  name: string;
  resetToken: string;
}

@Injectable()
export class SendPasswordRecoveryEmailUseCase extends BaseUseCase {
  constructor(
    @Inject(MAILER_SERVICE)
    private readonly mailer: IMailerService,
    @Inject(EMAIL_TEMPLATES)
    private readonly emailTemplates: IEmailTemplates,
  ) {
    super(SendPasswordRecoveryEmailUseCase.name);
  }

  public async execute(payload: PasswordRecoveryPayload): Promise<void> {
    const { email, name, resetToken } = payload;

    this.logger.log(
      JSON.stringify({
        action: 'SEND_PASSWORD_RECOVERY_EMAIL',
        status: 'start',
        email,
      }),
    );

    const subject = 'Recupere sua senha';
    const html = this.emailTemplates.passwordRecovery(name, email, resetToken);

    try {
      await this.mailer.sendEmail(email, subject, html);

      this.logger.log(
        JSON.stringify({
          action: 'SEND_PASSWORD_RECOVERY_EMAIL',
          status: 'success',
          email,
        }),
      );
    } catch (error) {
      if (error instanceof EmailDeliveryException) {
        this.logger.error(
          JSON.stringify({
            action: 'SEND_PASSWORD_RECOVERY_EMAIL',
            status: 'controlled_failure',
            email,
            message: error.message,
          }),
        );
        throw error;
      }

      this.logger.error(
        JSON.stringify({
          action: 'SEND_PASSWORD_RECOVERY_EMAIL',
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
