/* eslint-disable @typescript-eslint/unbound-method */
import { SendVerificationEmailUseCase, VerificationEmailPayload } from './send-verification-email.usecase';
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../templates/email.template';

describe('SendVerificationEmailUseCase', () => {
  let useCase: SendVerificationEmailUseCase;
  let mailer: IMailerService;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() } as unknown as IMailerService;
    useCase = new SendVerificationEmailUseCase(mailer);
    jest.spyOn(EmailTemplates, 'verificationEmail');
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    await useCase.execute(payload);

    expect(EmailTemplates.verificationEmail).toHaveBeenCalledWith('João', 'user@example.com', '123456');
    expect(mailer.sendEmail).toHaveBeenCalledWith('user@example.com', 'Verifique seu e-mail', expect.any(String));
  });

  it('should throw EmailDeliveryException if mailer throws it', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new EmailDeliveryException('user@example.com'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(EmailDeliveryException);
  });

  it('should throw ExternalServiceException if mailer throws unexpected error', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new Error('Unexpected'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ExternalServiceException);
  });
});
