/* eslint-disable @typescript-eslint/unbound-method */
import { SendAccountCreatedEmailUseCase, AccountCreatedPayload } from './send-account-created-email.usecase';
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../templates/email.template';

describe('SendAccountCreatedEmailUseCase', () => {
  let useCase: SendAccountCreatedEmailUseCase;
  let mailer: IMailerService;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() } as unknown as IMailerService;
    useCase = new SendAccountCreatedEmailUseCase(mailer);
    jest.spyOn(EmailTemplates, 'accountCreated');
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: AccountCreatedPayload = { email: 'test@example.com', name: 'João' };
    await useCase.execute(payload);

    expect(EmailTemplates.accountCreated).toHaveBeenCalledWith('João');
    expect(mailer.sendEmail).toHaveBeenCalledWith('test@example.com', 'Conta criada com sucesso', expect.any(String));
  });

  it('should throw EmailDeliveryException if mailer throws it', async () => {
    const payload: AccountCreatedPayload = { email: 'test@example.com', name: 'João' };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new EmailDeliveryException('test@example.com'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(EmailDeliveryException);
  });

  it('should throw ExternalServiceException if mailer throws unexpected error', async () => {
    const payload: AccountCreatedPayload = { email: 'test@example.com', name: 'João' };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new Error('Unexpected'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ExternalServiceException);
  });
});
