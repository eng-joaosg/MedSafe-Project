import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationException } from '../../common/exceptions/app.exception';
import * as nodemailer from 'nodemailer';

@Injectable()
export class KinghostSmtpMailerService {
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpUser: string;
  private readonly smtpPass: string;
  private readonly senderEmail: string;
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.smtpHost = this.getRequiredConfig('KINGHOST_SMTP_HOST');
    this.smtpPort = Number(this.getRequiredConfig('KINGHOST_SMTP_PORT'));
    this.smtpUser = this.getRequiredConfig('KINGHOST_SMTP_USER');
    this.smtpPass = this.getRequiredConfig('KINGHOST_SMTP_PASS');
    this.senderEmail = this.getRequiredConfig('KINGHOST_SMTP_FROM');

    this.transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpPort === 465,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPass,
      },
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new ConfigurationException(`Variável de ambiente obrigatória ausente: ${key}`);
    }
    return value;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.senderEmail,
      to,
      subject,
      html,
    });
  }
}
