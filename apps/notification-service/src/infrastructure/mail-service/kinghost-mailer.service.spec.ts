/* eslint-disable @typescript-eslint/unbound-method */
import { KinghostMailerService } from './kinghost-mailer.service';
import { KinghostApiMailerService } from './kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from './kinghost-smtp-mailer.service';
import { ConfigService } from '@nestjs/config';

describe('KinghostMailerService', () => {
  let service: KinghostMailerService;
  let apiMailer: KinghostApiMailerService;
  let smtpMailer: KinghostSmtpMailerService;

  const createService = (mainSender: 'API' | 'SMTP', useFallback = true) => {
    apiMailer = { sendEmail: jest.fn() } as unknown as KinghostApiMailerService;
    smtpMailer = { sendEmail: jest.fn() } as unknown as KinghostSmtpMailerService;

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'MAIN_MAIL_SENDER') return mainSender;
        if (key === 'USE_FALLBACK') return useFallback;
        return undefined;
      }),
    } as unknown as ConfigService;

    return new KinghostMailerService(apiMailer, smtpMailer, configService);
  };

  it('sends email via SMTP successfully (MAIN_MAIL_SENDER=SMTP)', async () => {
    service = createService('SMTP');
    (smtpMailer.sendEmail as jest.Mock).mockResolvedValue(undefined);

    await service.sendEmail('to@example.com', 'Subject', '<p>Body</p>');

    expect(smtpMailer.sendEmail).toHaveBeenCalledWith('to@example.com', 'Subject', '<p>Body</p>');
    expect(apiMailer.sendEmail).not.toHaveBeenCalled();
  });

  it('falls back to API if SMTP fails (MAIN_MAIL_SENDER=SMTP, USE_FALLBACK=true)', async () => {
    service = createService('SMTP', true);
    (smtpMailer.sendEmail as jest.Mock).mockRejectedValue(new Error('SMTP fail'));
    (apiMailer.sendEmail as jest.Mock).mockResolvedValue(undefined);

    await service.sendEmail('to@example.com', 'Subject', '<p>Body</p>');

    expect(smtpMailer.sendEmail).toHaveBeenCalled();
    expect(apiMailer.sendEmail).toHaveBeenCalledWith('to@example.com', 'Subject', '<p>Body</p>');
  });
});
