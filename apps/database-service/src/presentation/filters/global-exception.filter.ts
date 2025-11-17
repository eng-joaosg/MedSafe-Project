import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { CommonLogger } from 'src/common/common-logger';
import { AppException, ConfigurationException, RemoteServiceError } from 'src/common/exceptions/app.exceptions';

/**
 * Sanitiza mensagens de erro, evitando exposição de dados sensíveis
 * ou objetos não serializáveis diretamente nos logs.
 */
function sanitizeError(error: unknown): string {
  if (!error) return '';

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    return error.message;
  }

  try {
    // Remove campos sensíveis comuns
    const sanitized: Record<string, any> = {
      ...(error as Record<string, any>),
    };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.accessToken;
    delete sanitized.refreshToken;

    return JSON.stringify(sanitized);
  } catch {
    // fallback para objetos não serializáveis (ciclos de referência, proxies, etc.)
    return '[unserializable error object]';
  }
}

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const method = request.method;
    const url = request.url;
    const requestId = request.headers['x-request-id'] || '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocorreu um erro interno desconhecido.';

    // --- AppException e subclasses
    if (exception instanceof AppException) {
      const appErr = exception;
      status = appErr.getStatus ? appErr.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      message = appErr.message;

      CommonLogger.warn(
        'GlobalExceptionFilter',
        'APP_EXCEPTION',
        `[${requestId}] [${method}] ${url} → ${status} - ${sanitizeError(message)}`,
      );
    }
    // --- HttpException genérica
    else if (exception instanceof HttpException) {
      const httpErr = exception;
      status = httpErr.getStatus();
      const responseBody = httpErr.getResponse();
      message = typeof responseBody === 'string' ? responseBody : (responseBody as any).message || httpErr.message;

      CommonLogger.warn(
        'GlobalExceptionFilter',
        'HTTP_EXCEPTION',
        `[${requestId}] [${method}] ${url} → ${status} - ${sanitizeError(message)}`,
      );
    }
    // --- RemoteServiceError
    else if (exception instanceof RemoteServiceError) {
      const remoteErr = exception;
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'O serviço de dados está temporariamente indisponível. Tente novamente.';

      CommonLogger.error(
        'GlobalExceptionFilter',
        'REMOTE_SERVICE_FAILURE',
        `[${requestId}] [${method}] ${url} → ${status} - ${sanitizeError(remoteErr.message)}`,
        sanitizeError(remoteErr.originalError),
      );
    }
    // --- ConfigurationException
    else if (exception instanceof ConfigurationException) {
      const configErr = exception;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = configErr.message;

      CommonLogger.error(
        'GlobalExceptionFilter',
        'CONFIG_ERROR',
        `[${requestId}] [${method}] ${url} → ${status} - ${sanitizeError(message)}`,
      );
    }
    // --- Erros não tratados
    else if (exception instanceof Error) {
      const err = exception;
      message = err.message || 'Erro interno do servidor.';

      CommonLogger.error(
        'GlobalExceptionFilter',
        'UNHANDLED_ERROR',
        `[${requestId}] [${method}] ${url} → ${status} - ${sanitizeError(message)}`,
        sanitizeError(err.stack),
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      message,
      requestId: requestId || undefined,
    });
  }
}
