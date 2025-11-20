/* eslint-disable @typescript-eslint/unbound-method */
import { SendVerificationEmailUseCase, VerificationEmailPayload } from './send-verification-email.usecase';
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../templates/email.template';

describe('SendVerificationEmailUseCase', () => {
  let useCase: SendVerificationEmailUseCase;
  let mailer: { sendEmail: jest.Mock<Promise<void>, [string, string, string]> };

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() };
    useCase = new SendVerificationEmailUseCase(mailer as unknown as IMailerService);
    jest.spyOn(EmailTemplates, 'verificationEmail').mockReturnValue('<html>mocked</html>');
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    await useCase.execute(payload);

    expect(EmailTemplates.verificationEmail).toHaveBeenCalledWith('João', 'user@example.com', '123456');
    expect(mailer.sendEmail).toHaveBeenCalledWith('user@example.com', 'Verifique seu e-mail', '<html>mocked</html>');
  });

  it('should throw EmailDeliveryException if mailer throws it', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    mailer.sendEmail.mockRejectedValue(new EmailDeliveryException('user@example.com'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(EmailDeliveryException);
  });

  it('should throw ExternalServiceException if mailer throws unexpected error', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    mailer.sendEmail.mockRejectedValue(new Error('Unexpected'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ExternalServiceException);
  });
});
