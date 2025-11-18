import { Injectable } from '@nestjs/common';
import { KinghostApiMailerService } from './kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from './kinghost-smtp-mailer.service';
import { EmailDeliveryException } from '../../common/exceptions/app.exception';
import { IMailerService } from '../../application/services/i-mailer.service';
import { CommonLogger } from '../../common/logger/common.logger';

const SERVICE_NAME = 'NOTIFICATION SERVICE';

@Injectable()
export class KinghostMailerService implements IMailerService {
  constructor(
    private readonly apiMailer: KinghostApiMailerService,
    private readonly smtpMailer: KinghostSmtpMailerService,
  ) {}

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const action = 'SEND_EMAIL_ATTEMPT';

    try {
      await this.apiMailer.sendEmail(to, subject, html);
      CommonLogger.info(SERVICE_NAME, action, `E-mail enviado com sucesso para ${to} via API.`);
      return;
    } catch (apiError) {
      const apiErrorMessage = `Falha ao enviar e-mail para ${to} via API. Tentando fallback SMTP. Erro: ${
        apiError instanceof Error ? apiError.message : String(apiError)
      }`;

      CommonLogger.warn(SERVICE_NAME, action, apiErrorMessage);
      //fallback
      try {
        await this.smtpMailer.sendEmail(to, subject, html);
        CommonLogger.info(SERVICE_NAME, action, `E-mail enviado com sucesso para ${to} via Fallback SMTP.`);
        return;
      } catch (smtpError: any) {
        CommonLogger.error(SERVICE_NAME, action, `Falha TOTAL ao enviar e-mail para ${to}. API e SMTP falharam.`, smtpError as Error);

        if (smtpError.response?.status === 400 && smtpError.response?.data?.code === 'INVALID_RECIPIENT') {
          throw new EmailDeliveryException(to, smtpError as Error);
        }

        throw new EmailDeliveryException(to, smtpError as Error);
      }
    }
  }
}
