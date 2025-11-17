import { Injectable } from '@nestjs/common';
import { KinghostApiMailerService } from './kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from './kinghost-smtp-mailer.service';
import { EmailDeliveryException } from '../../common/exceptions/app.exception';
import { IMailerService } from '../../application/services/i-mailer.service';

@Injectable()
export class KinghostMailerService implements IMailerService {
  constructor(
    private readonly apiMailer: KinghostApiMailerService,
    private readonly smtpMailer: KinghostSmtpMailerService,
  ) {}

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.smtpMailer.sendEmail(to, subject, html);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.code === 'INVALID_RECIPIENT') {
        throw new EmailDeliveryException(to, error as Error);
      }
      // Fallback para Api
      try {
        await this.apiMailer.sendEmail(to, subject, html);
      } catch (smtpError) {
        throw new EmailDeliveryException(to, smtpError as Error);
      }
    }
  }
}
