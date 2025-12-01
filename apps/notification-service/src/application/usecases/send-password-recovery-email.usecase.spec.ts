/* eslint-disable @typescript-eslint/unbound-method */
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../utils/email.template';
import { PasswordRecoveryPayload, SendPasswordRecoveryEmailUseCase } from './send-password-recovery-email.usecase';
import { ConfigService } from '@nestjs/config';
import { AppLinks } from '../utils/app-links';

describe('SendPasswordRecoveryEmailUseCase', () => {
  let useCase: SendPasswordRecoveryEmailUseCase;
  let mailer: IMailerService;
  let emailTemplates: EmailTemplates;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() } as unknown as IMailerService;
    const configService = { get: jest.fn().mockReturnValue('http://localhost:3000') } as unknown as ConfigService;
    const appLinks = new AppLinks(configService);
    emailTemplates = new EmailTemplates(appLinks);

    useCase = new SendPasswordRecoveryEmailUseCase(mailer, emailTemplates);
    jest.spyOn(emailTemplates, 'passwordRecovery');
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: PasswordRecoveryPayload = { email: 'user@example.com', name: 'João', resetToken: '1234' };
    await useCase.execute(payload);

    expect(emailTemplates.passwordRecovery).toHaveBeenCalledWith('João', 'user@example.com', '1234');

    expect(mailer.sendEmail).toHaveBeenCalledWith('user@example.com', 'Recupere sua senha', expect.any(String));
  });

  it('should throw EmailDeliveryException if mailer throws it', async () => {
    const payload: PasswordRecoveryPayload = { email: 'user@example.com', name: 'João', resetToken: '1234' };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new EmailDeliveryException('user@example.com'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(EmailDeliveryException);
  });

  it('should throw ExternalServiceException if mailer throws unexpected error', async () => {
    const payload: PasswordRecoveryPayload = { email: 'user@example.com', name: 'João', resetToken: '1234' };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new Error('Unexpected'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ExternalServiceException);
  });
});
