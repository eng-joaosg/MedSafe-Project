/* eslint-disable @typescript-eslint/unbound-method */
import { KinghostMailerService } from './kinghost-mailer.service';
import { KinghostApiMailerService } from './kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from './kinghost-smtp-mailer.service';
import { EmailDeliveryException } from '../../common/exceptions/app.exception';

describe('KinghostMailerService', () => {
  let service: KinghostMailerService;
  let apiMailer: KinghostApiMailerService;
  let smtpMailer: KinghostSmtpMailerService;

  beforeEach(() => {
    // Inicializa mocks para os serviços
    apiMailer = { sendEmail: jest.fn() } as unknown as KinghostApiMailerService;
    smtpMailer = { sendEmail: jest.fn() } as unknown as KinghostSmtpMailerService;

    service = new KinghostMailerService(apiMailer, smtpMailer);
    jest.clearAllMocks();
  });

  it('sends email via API successfully (API-First)', async () => {
    // 1. API SUCESSO (Método principal)
    (apiMailer.sendEmail as jest.Mock).mockResolvedValue(undefined);

    await service.sendEmail('to@example.com', 'Subject', '<p>Body</p>');

    // Deve chamar a API e não o SMTP
    expect(apiMailer.sendEmail).toHaveBeenCalledWith('to@example.com', 'Subject', '<p>Body</p>');
    expect(smtpMailer.sendEmail).not.toHaveBeenCalled();
  });

  it('falls back to SMTP if API fails', async () => {
    // 1. API FALHA
    (apiMailer.sendEmail as jest.Mock).mockRejectedValue(new Error('API failure'));
    // 2. SMTP SUCESSO (Fallback)
    (smtpMailer.sendEmail as jest.Mock).mockResolvedValue(undefined);

    await service.sendEmail('to@example.com', 'Subject', '<p>Body</p>');

    // Deve chamar ambos (API tentada, SMTP fallback com sucesso)
    expect(apiMailer.sendEmail).toHaveBeenCalled();
    expect(smtpMailer.sendEmail).toHaveBeenCalledWith('to@example.com', 'Subject', '<p>Body</p>');
  });

  it('throws EmailDeliveryException if both API and SMTP fail (General Failure)', async () => {
    // 1. API FALHA
    (apiMailer.sendEmail as jest.Mock).mockRejectedValue(new Error('API fail'));
    // 2. SMTP FALHA
    (smtpMailer.sendEmail as jest.Mock).mockRejectedValue(new Error('SMTP fail'));

    // Espera que a exceção seja lançada após a falha do SMTP
    await expect(service.sendEmail('to@example.com', 'Subject', '<p>Body</p>')).rejects.toBeInstanceOf(EmailDeliveryException);

    // Ambos devem ser chamados
    expect(apiMailer.sendEmail).toHaveBeenCalled();
    expect(smtpMailer.sendEmail).toHaveBeenCalled();
  });

  it('throws EmailDeliveryException after API failure if SMTP fails with INVALID_RECIPIENT', async () => {
    // 1. API FALHA
    (apiMailer.sendEmail as jest.Mock).mockRejectedValue(new Error('API fail'));

    // 2. SMTP FALHA com erro específico (que lança a exceção após o fallback)
    const smtpErrorWithRecipient = {
      response: {
        status: 400,
        data: {
          code: 'INVALID_RECIPIENT',
        },
      },
    };
    (smtpMailer.sendEmail as jest.Mock).mockRejectedValue(smtpErrorWithRecipient);

    // Espera que a exceção seja lançada
    await expect(service.sendEmail('to@example.com', 'Subject', '<p>Body</p>')).rejects.toBeInstanceOf(EmailDeliveryException);

    // Ambos devem ser chamados
    expect(apiMailer.sendEmail).toHaveBeenCalled();
    expect(smtpMailer.sendEmail).toHaveBeenCalled();
  });
});
