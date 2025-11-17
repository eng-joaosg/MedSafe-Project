import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(message: string, status?: HttpStatus) {
    super(message, status ?? HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ExternalServiceException extends AppException {
  constructor(serviceName: string, details?: string) {
    const message = `Erro ao comunicar com serviço externo: ${serviceName}.` + (details ? ` Detalhes: ${details}` : '');
    super(message, HttpStatus.BAD_GATEWAY);
  }
}

export class ConfigurationException extends AppException {
  constructor(message: string) {
    super(`[CONFIG] Erro de inicialização da aplicação: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class EmailDeliveryException extends Error {
  constructor(email: string, cause?: Error) {
    super(`Falha ao entregar e-mail para: ${email}`);
    this.name = 'EmailDeliveryException';
    if (cause) {
      this.stack = cause.stack;
    }
  }
}
