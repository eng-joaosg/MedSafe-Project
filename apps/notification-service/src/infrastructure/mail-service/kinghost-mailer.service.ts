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
      // 1. Tentar enviar via API (MÉTODO PRINCIPAL)
      await this.apiMailer.sendEmail(to, subject, html);
      CommonLogger.info(SERVICE_NAME, action, `E-mail enviado com sucesso para ${to} via API.`);
      return;
    } catch (apiError) {
      const apiErrorMessage = `Falha ao enviar e-mail para ${to} via API. Tentando fallback SMTP. Erro: ${
        apiError instanceof Error ? apiError.message : String(apiError)
      }`;

      CommonLogger.warn(SERVICE_NAME, action, apiErrorMessage);

      // 2. Fallback para SMTP
      try {
        await this.smtpMailer.sendEmail(to, subject, html);
        CommonLogger.info(SERVICE_NAME, action, `E-mail enviado com sucesso para ${to} via Fallback SMTP.`);
        return;
      } catch (smtpError: any) {
        // 3. Falha Total: API e SMTP falharam
        CommonLogger.error(SERVICE_NAME, action, `Falha TOTAL ao enviar e-mail para ${to}. API e SMTP falharam.`, smtpError as Error);

        // Condição especial de erro do SMTP (lançamento imediato)
        if (smtpError.response?.status === 400 && smtpError.response?.data?.code === 'INVALID_RECIPIENT') {
          throw new EmailDeliveryException(to, smtpError as Error);
        }

        // Lançar exceção de falha na entrega, usando o último erro (SMTP)
        throw new EmailDeliveryException(to, smtpError as Error);
      }
    }
  }
}
