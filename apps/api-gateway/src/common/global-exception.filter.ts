/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AppException } from './app.exceptions';
import { AxiosError } from 'axios';

const GENERIC_MESSAGES: Record<number, string> = {
  400: 'Bad request.',
  401: 'Unauthorized.',
  402: 'Payment required.',
  403: 'Forbidden.',
  404: 'Not found.',
  409: 'Conflict.',
};

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro no servidor.';

    if (exception instanceof AppException) {
      status = (exception as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = (exception as any).message || message;
    } else if (exception instanceof AxiosError) {
      status = exception.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Se for código conhecido, usa mensagem genérica específica
    if (GENERIC_MESSAGES[status]) {
      message = GENERIC_MESSAGES[status];
    } else if (status >= 400 && status < 500) {
      message = 'Erro na requisição.';
    } else if (status >= 500) {
      message = 'Erro no servidor.';
    }

    // Log simplificado
    if (status >= 400 && status < 500) {
      console.log(`[WARN] [${status}] Um erro de cliente ocorreu.`);
    } else {
      console.error(`[ERROR] [${status}] Um erro interno ocorreu.`);
    }
    response.status(status).json({ message });
  }
}
