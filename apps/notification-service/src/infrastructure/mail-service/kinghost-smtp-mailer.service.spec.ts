import { KinghostSmtpMailerService } from './kinghost-smtp-mailer.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ConfigurationException } from '../../common/exceptions/app.exception';

jest.mock('nodemailer');

describe('KinghostSmtpMailerService', () => {
  let service: KinghostSmtpMailerService;
  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  const sendMailMock = jest.fn();
  (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws ConfigurationException if a required env is missing', () => {
    mockConfigService.get = jest.fn().mockReturnValueOnce(undefined);
    expect(() => new KinghostSmtpMailerService(mockConfigService)).toThrow(ConfigurationException);
  });

  it('creates transporter with correct config', () => {
    mockConfigService.get = jest.fn().mockImplementation((key: string) => {
      const map = {
        KINGHOST_SMTP_HOST: 'smtp.example.com',
        KINGHOST_SMTP_PORT: '587',
        KINGHOST_SMTP_USER: 'user',
        KINGHOST_SMTP_PASS: 'pass',
        KINGHOST_SMTP_FROM: 'from@example.com',
      };
      return map[key];
    });

    service = new KinghostSmtpMailerService(mockConfigService);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
    });
  });

  it('sendEmail calls transporter.sendMail with correct params', async () => {
    mockConfigService.get = jest.fn().mockImplementation((key: string) => {
      const map = {
        KINGHOST_SMTP_HOST: 'smtp.example.com',
        KINGHOST_SMTP_PORT: '587',
        KINGHOST_SMTP_USER: 'user',
        KINGHOST_SMTP_PASS: 'pass',
        KINGHOST_SMTP_FROM: 'from@example.com',
      };
      return map[key];
    });

    service = new KinghostSmtpMailerService(mockConfigService);

    await service.sendEmail('to@example.com', 'Hello', '<p>Test</p>');

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'from@example.com',
      to: 'to@example.com',
      subject: 'Hello',
      html: '<p>Test</p>',
    });
  });
});
