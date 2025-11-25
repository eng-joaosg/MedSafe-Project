/* eslint-disable @typescript-eslint/unbound-method */
import { SendAccountCreatedEmailUseCase, AccountCreatedPayload } from './send-account-created-email.usecase';
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import type { IEmailTemplates } from '../contracts/i-email-templates';

describe('SendAccountCreatedEmailUseCase', () => {
  let useCase: SendAccountCreatedEmailUseCase;
  let mailer: jest.Mocked<IMailerService>;
  let emailTemplatesMock: jest.Mocked<IEmailTemplates>;

  beforeEach(() => {
    // Mock do mailer
    mailer = {
      sendEmail: jest.fn(),
    } as jest.Mocked<IMailerService>;

    // Mock do EmailTemplates
    emailTemplatesMock = {
      accountCreated: jest.fn().mockReturnValue('<html>Conta criada</html>'),
    } as unknown as jest.Mocked<IEmailTemplates>;

    // Criar instância do use case com mocks tipados
    useCase = new SendAccountCreatedEmailUseCase(mailer, emailTemplatesMock);
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: AccountCreatedPayload = { email: 'test@example.com', name: 'João' };
    await useCase.execute(payload);

    expect(emailTemplatesMock.accountCreated).toHaveBeenCalledWith('João');
    expect(mailer.sendEmail).toHaveBeenCalledWith('test@example.com', 'Conta criada com sucesso', '<html>Conta criada</html>');
  });

  it('should throw EmailDeliveryException if mailer throws it', async () => {
    const payload: AccountCreatedPayload = { email: 'test@example.com', name: 'João' };
    mailer.sendEmail.mockRejectedValueOnce(new EmailDeliveryException('test@example.com'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(EmailDeliveryException);
  });

  it('should throw ExternalServiceException if mailer throws unexpected error', async () => {
    const payload: AccountCreatedPayload = { email: 'test@example.com', name: 'João' };
    mailer.sendEmail.mockRejectedValueOnce(new Error('Unexpected'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ExternalServiceException);
  });
});
