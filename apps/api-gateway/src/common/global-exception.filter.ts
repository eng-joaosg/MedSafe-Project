import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { CommonLoggerGateway } from './common.logger';
import { AppException, ConfigurationException, RemoteServiceError } from './app.exceptions';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let message = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // --- AppException
    if (exception instanceof AppException) {
      message = exception.message;
      status = exception.getStatus();
      CommonLoggerGateway.warn('GlobalExceptionFilter', 'APP_EXCEPTION', exception);
    }
    // --- HttpException
    else if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      message = typeof responseBody === 'string' ? responseBody : (responseBody as any).message || 'Ocorreu um erro inesperado.';
      status = exception.getStatus();
      CommonLoggerGateway.warn('GlobalExceptionFilter', 'HTTP_EXCEPTION', exception);
    }
    // --- RemoteServiceError
    else if (exception instanceof RemoteServiceError) {
      message = 'O serviço de dados está temporariamente indisponível.';
      status = HttpStatus.SERVICE_UNAVAILABLE;
      CommonLoggerGateway.error('GlobalExceptionFilter', 'REMOTE_SERVICE_FAILURE', exception, exception.originalError);
    }
    // --- ConfigurationException
    else if (exception instanceof ConfigurationException) {
      message = 'Erro de configuração. Contate o suporte.';
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      CommonLoggerGateway.error('GlobalExceptionFilter', 'CONFIG_ERROR', exception);
    }
    // --- Outros erros não tratados
    else if (exception instanceof Error) {
      message = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      CommonLoggerGateway.error('GlobalExceptionFilter', 'UNHANDLED_ERROR', exception, exception.stack);
    }

    // --- Envia a resposta final para o front
    response.status(status).json({ message });
  }
}
