/* eslint-disable @typescript-eslint/unbound-method */
import { SendPublicDataAccessAlertEmailUseCase, PublicDataAccessPayload } from './send-public-data-access-alert-email.usecase';
import { IMailerService } from '../services/i-mailer.service';
import { EmailDeliveryException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { EmailTemplates } from '../utils/email.template';

describe('SendPublicDataAccessAlertEmailUseCase', () => {
  let useCase: SendPublicDataAccessAlertEmailUseCase;
  let mailer: IMailerService;
  let emailTemplates: EmailTemplates;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn() } as unknown as IMailerService;

    // Mock de EmailTemplates retornando uma string
    emailTemplates = {
      publicDataAccess: jest.fn().mockReturnValue('Mensagem de alerta'),
    } as unknown as EmailTemplates;

    useCase = new SendPublicDataAccessAlertEmailUseCase(mailer, emailTemplates);
  });

  it('should call mailer with correct subject and template', async () => {
    const payload: PublicDataAccessPayload = { email: 'user@example.com', name: 'João', accessedAt: new Date() };
    await useCase.execute(payload);

    expect(emailTemplates.publicDataAccess).toHaveBeenCalledWith('João', payload.accessedAt);
    expect(mailer.sendEmail).toHaveBeenCalledWith('user@example.com', 'Aviso de acesso aos seus dados públicos', expect.any(String));
  });

  it('should throw EmailDeliveryException if mailer throws it', async () => {
    const payload: PublicDataAccessPayload = { email: 'user@example.com', name: 'João', accessedAt: new Date() };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new EmailDeliveryException('user@example.com'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(EmailDeliveryException);
  });

  it('should throw ExternalServiceException if mailer throws unexpected error', async () => {
    const payload: PublicDataAccessPayload = { email: 'user@example.com', name: 'João', accessedAt: new Date() };
    (mailer.sendEmail as jest.Mock).mockRejectedValue(new Error('Unexpected'));

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ExternalServiceException);
  });
});
