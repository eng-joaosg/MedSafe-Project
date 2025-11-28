import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KinghostApiMailerService } from './kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from './kinghost-smtp-mailer.service';
import { EmailDeliveryException } from '../../common/exceptions/app.exception';
import { IMailerService } from '../../application/services/i-mailer.service';
import { CommonLogger } from '../../common/logger/common.logger';

const SERVICE_NAME = 'NOTIFICATION SERVICE';

@Injectable()
export class KinghostMailerService implements IMailerService {
  private readonly mainSender: 'API' | 'SMTP';
  private readonly useFallback: 'true' | 'false';

  constructor(
    private readonly apiMailer: KinghostApiMailerService,
    private readonly smtpMailer: KinghostSmtpMailerService,
    private readonly configService: ConfigService,
  ) {
    this.mainSender = this.configService.get<string>('MAIN_MAIL_SENDER', 'API') as 'API' | 'SMTP';
    this.useFallback = this.configService.get<string>('USE_FALLBACK', 'true') as 'true' | 'false';
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const action = 'SEND_EMAIL_ATTEMPT';

    const trySend = async (sender: 'API' | 'SMTP') => {
      switch (sender) {
        case 'API':
          CommonLogger.info(SERVICE_NAME, action, `Tentando enviar e-mail para ${to} via API.`);
          await this.apiMailer.sendEmail(to, subject, html);
          CommonLogger.info(SERVICE_NAME, action, `E-mail enviado com sucesso para ${to} via API.`);
          break;
        case 'SMTP':
          CommonLogger.info(SERVICE_NAME, action, `Tentando enviar e-mail para ${to} via SMTP.`);
          await this.smtpMailer.sendEmail(to, subject, html);
          CommonLogger.info(SERVICE_NAME, action, `E-mail enviado com sucesso para ${to} via SMTP.`);
          break;
      }
    };

    try {
      await trySend(this.mainSender);
    } catch (error) {
      CommonLogger.warn(
        SERVICE_NAME,
        action,
        `Falha ao enviar e-mail via ${this.mainSender}: ${error instanceof Error ? error.message : String(error)}`,
      );

      if (this.useFallback === 'true') {
        const fallbackSender = this.mainSender === 'API' ? 'SMTP' : 'API';
        CommonLogger.info(SERVICE_NAME, action, `Tentando fallback via ${fallbackSender}...`);
        try {
          await trySend(fallbackSender);
        } catch (fallbackError) {
          CommonLogger.error(
            SERVICE_NAME,
            action,
            `Falha TOTAL ao enviar e-mail para ${to}. API e SMTP falharam.`,
            fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)),
          );
          throw new EmailDeliveryException(to, fallbackError instanceof Error ? fallbackError : undefined);
        }
      } else {
        throw new EmailDeliveryException(to, error instanceof Error ? error : undefined);
      }
    }
  }
}
