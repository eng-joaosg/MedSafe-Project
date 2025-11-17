import { Inject, Injectable } from '@nestjs/common';
import type { IMailerService } from '../services/i-mailer.service';
import { BaseUseCase } from './base.usecase';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../../application/templates/email.template';

export interface VerificationEmailPayload {
  email: string;
  name: string;
  verificationCode: string;
}

@Injectable()
export class SendVerificationEmailUseCase extends BaseUseCase {
  constructor(
    @Inject('IMailerService')
    private readonly mailer: IMailerService,
  ) {
    super(SendVerificationEmailUseCase.name);
  }

  public async execute(payload: VerificationEmailPayload): Promise<void> {
    const { email, name, verificationCode } = payload;

    this.logger.log(
      JSON.stringify({
        action: 'SEND_VERIFICATION_EMAIL',
        status: 'start',
        email,
      }),
    );

    const subject = 'Verifique seu e-mail';
    const html = EmailTemplates.verificationEmail(name, email, verificationCode);

    try {
      await this.mailer.sendEmail(email, subject, html);

      this.logger.log(
        JSON.stringify({
          action: 'SEND_VERIFICATION_EMAIL',
          status: 'success',
          email,
        }),
      );
    } catch (error) {
      if (error instanceof EmailDeliveryException) {
        this.logger.error(
          JSON.stringify({
            action: 'SEND_VERIFICATION_EMAIL',
            status: 'controlled_failure',
            email,
            message: error.message,
          }),
        );
        throw error;
      }

      this.logger.error(
        JSON.stringify({
          action: 'SEND_VERIFICATION_EMAIL',
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
