/* eslint-disable @typescript-eslint/unbound-method */
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../templates/email.template';
import { PasswordRecoveryPayload, SendPasswordRecoveryEmailUseCase } from './send-password-recovery-email.usecase';

describe('SendPasswordRecoveryEmailUseCase', () => {
  let useCase: SendPasswordRecoveryEmailUseCase;
  let mailer: IMailerService;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() } as unknown as IMailerService;
    useCase = new SendPasswordRecoveryEmailUseCase(mailer);
    jest.spyOn(EmailTemplates, 'passwordRecovery');
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: PasswordRecoveryPayload = { email: 'user@example.com', name: 'João', resetToken: '1234' };
    await useCase.execute(payload);

    expect(EmailTemplates.passwordRecovery).toHaveBeenCalledWith('João', '1234');
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
