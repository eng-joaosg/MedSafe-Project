import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(message: string, status?: HttpStatus) {
    super(message, status ?? HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ServerError extends Error {
  public readonly status?: HttpStatus;

  constructor(message: string, status?: HttpStatus) {
    super(message);
    this.status = status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export class UserNotFoundException extends AppException {
  constructor(message = 'Usuário não encontrado') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class InvalidPasswordException extends AppException {
  constructor(message = 'Senha incorreta.') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class UserAlreadyExistsException extends AppException {
  constructor(message = 'E-mail já cadastrado') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class InvalidVerificationCodeException extends AppException {
  constructor(message = 'Código de verificação inválido') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class VerificationCodeExpiredException extends AppException {
  constructor(message = 'Código de verificação expirado') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class UserAlreadyActiveException extends AppException {
  constructor(message = 'Conta já está ativa') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class UserNotActiveException extends AppException {
  constructor(message = 'Conta de usuário não está ativa. Por favor, verifique seu e-mail.') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class InvalidCredentialsException extends AppException {
  constructor(message = 'Credenciais de acesso inválidas (E-mail ou senha incorretos)') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ConfigurationException extends ServerError {
  public readonly name = 'ConfigError';

  constructor(message: string) {
    super(`[CONFIG] Erro de inicialização da aplicação: ${message}`);
    Object.setPrototypeOf(this, ConfigurationException.prototype);
  }
}

export class RemoteServiceError extends ServerError {
  public readonly name = 'RemoteServiceError';
  public readonly originalError?: any;

  constructor(serviceName: string, originalError?: any) {
    let message = `Falha de comunicação com o serviço remoto: ${serviceName}.`;

    if (originalError?.message) {
      message += ` Detalhes: ${originalError.message}`;
    } else if (originalError) {
      message += ` Detalhes: Erro genérico (${originalError.toString()})`;
    }

    super(message);
    this.originalError = originalError;

    Object.setPrototypeOf(this, RemoteServiceError.prototype);
  }
}

export class ExternalServiceException extends ServerError {
  public readonly name = 'ExternalServiceException';
  public readonly originalError?: any;

  constructor(serviceName: string, originalError?: any) {
    let message = `Erro ao comunicar com serviço externo: ${serviceName}.`;

    if (originalError?.message) {
      message += ` Detalhes: ${originalError.message}`;
    } else if (originalError) {
      message += ` Detalhes: Erro genérico (${originalError.toString()})`;
    }

    super(message, HttpStatus.BAD_GATEWAY);
    this.originalError = originalError;

    Object.setPrototypeOf(this, ExternalServiceException.prototype);
  }
}

export class InvalidApiKeyError extends ServerError {
  constructor(message?: string) {
    super(message ?? 'Chave de API inválida ou ausente');
    this.name = 'InvalidApiKeyError';
  }
}

export class UnknownActionError extends ServerError {
  constructor(action: string) {
    super(`Ação desconhecida: ${action}`);
    this.name = 'UnknownActionError';
  }
}

export class ClinicalInfoAlreadyAssociatedException extends AppException {
  constructor(message = 'Este usuário já possui informações clínicas associadas.') {
    super(message, HttpStatus.CONFLICT);
  }
}
