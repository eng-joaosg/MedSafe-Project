/* eslint-disable @typescript-eslint/unbound-method */
import { SendVerificationEmailUseCase, VerificationEmailPayload } from './send-verification-email.usecase';
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../utils/email.template';
import { ConfigService } from '@nestjs/config';
import { AppLinks } from '../utils/app-links';

describe('SendVerificationEmailUseCase', () => {
  let useCase: SendVerificationEmailUseCase;
  let mailer: { sendEmail: jest.Mock<Promise<void>, [string, string, string]> };
  let emailTemplates: EmailTemplates;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() };
    const configService = { get: jest.fn().mockReturnValue('http://localhost:3000') } as unknown as ConfigService;
    const appLinks = new AppLinks(configService);
    emailTemplates = new EmailTemplates(appLinks);

    // Espiar o método da instância
    jest.spyOn(emailTemplates, 'verificationEmail').mockReturnValue('<html>mocked</html>');

    useCase = new SendVerificationEmailUseCase(mailer as unknown as IMailerService, emailTemplates);
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: VerificationEmailPayload = { email: 'user@example.com', name: 'João', verificationCode: '123456' };
    await useCase.execute(payload);

    expect(emailTemplates.verificationEmail).toHaveBeenCalledWith('João', 'user@example.com', '123456');
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
