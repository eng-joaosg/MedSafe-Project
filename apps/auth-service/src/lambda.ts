import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from './app.module';
import { FindEmailClientUserHandler } from './presentation/handlers/client-user/find-email-client-user.handler';
import { RegisterClientUserHandler } from './presentation/handlers/client-user/register-client-user.handler';
import { ConfigService } from '@nestjs/config';
import { CommonLogger } from './common/logger/common.logger';
import { RequestContextService } from './common/request-context/request-context.service';
import { AppException, InvalidApiKeyError, ServerError, UnknownActionError } from './common/exceptions/app.exception';
import { VerifyAccountClientUserHandler } from './presentation/handlers/client-user/verify-account-client-user.handler';
import {
  FindEmailPayload,
  RegisterClientUserPayload,
  VerifyAccountClientUserPayload,
} from './presentation/handlers/client-user/client-user.types';
import { ulid } from 'ulid';

export interface LambdaEvent {
  requestId?: string;
  headers?: Record<string, string>;
  action: string;
  body?: any;
}

export interface LambdaResponse {
  id: string;
  statusCode: number;
  message: string;
  body?: any;
}

let app: INestApplicationContext | null = null;

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  const requestId = event.requestId ?? ulid();

  try {
    if (!app) app = await NestFactory.createApplicationContext(AppModule);
    if (!app) throw new Error('Erro na inicialização do AppModule.');
    const requestContext = app.get(RequestContextService);

    // -------------------------
    // Normaliza headers
    // -------------------------
    const headers = event.headers || {};
    const normalizedHeaders = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    const finalRequestId = normalizedHeaders['x-request-id'] ?? requestId;

    // -------------------------
    // Inicializa AsyncLocalStorage com requestId
    // -------------------------
    const initialContext = new Map<string, any>();
    initialContext.set('requestId', finalRequestId);

    return await requestContext.run<Promise<LambdaResponse>>(async () => {
      CommonLogger.setRequestContext(requestContext);

      const configService = app!.get(ConfigService);

      // -------------------------
      // Valida API Key
      // -------------------------
      const requiredKey = configService.get<string>('AUTH_SERVICE_API_KEY');
      const incomingKey = normalizedHeaders['x-api-key'];
      if (!requiredKey || requiredKey !== incomingKey) {
        CommonLogger.warn('Auth', 'INVALID_API_KEY', 'API Key inválida');
        throw new InvalidApiKeyError();
      }

      // -------------------------
      // Parse do payload
      // -------------------------
      let payload: any = event.body ?? {};
      if (payload.body && typeof payload.body === 'object') payload = payload.body;

      const start = Date.now();

      // -------------------------
      // Executa ação
      // -------------------------
      switch (event.action) {
        case 'findEmailClientUser': {
          const handlerInstance = app!.get(FindEmailClientUserHandler);
          const body = await withTimeout(handlerInstance.execute(payload as FindEmailPayload), 10000);
          logDuration(start, event.action);
          return toLambdaResponse(finalRequestId, 200, 'Sucesso', body);
        }

        case 'registerClientUser': {
          const handlerInstance = app!.get(RegisterClientUserHandler);
          const body = await withTimeout(handlerInstance.execute(payload as RegisterClientUserPayload), 10000);
          logDuration(start, event.action);
          return toLambdaResponse(finalRequestId, 201, 'Sucesso', body);
        }

        case 'verifyAccountClientUser': {
          const handlerInstance = app!.get(VerifyAccountClientUserHandler);
          const body = await withTimeout(handlerInstance.execute(payload as VerifyAccountClientUserPayload), 10000);
          logDuration(start, event.action);
          return toLambdaResponse(finalRequestId, 200, 'Sucesso', body);
        }

        default:
          CommonLogger.warn('Action', 'UNKNOWN', `Ação desconhecida: ${event.action}`);
          throw new UnknownActionError(event.action);
      }
    }, initialContext);
  } catch (err: unknown) {
    if (err instanceof AppException) return toLambdaResponse(requestId, err.getStatus(), err.message);
    if (err instanceof ServerError) return toLambdaResponse(requestId, 500, err.message);
    if (err instanceof Error && err.message.includes('Timeout')) {
      return toLambdaResponse(requestId, 504, 'Serviço demorou demais para responder. Tente novamente mais tarde.');
    }
    if (err instanceof Error) {
      CommonLogger.error('Handler', 'UNHANDLED_ERROR', err.message, err.stack);
    }
    return toLambdaResponse(requestId, 500, 'Erro interno desconhecido.');
  }
};

// --------------------------------------------
// Helpers
// --------------------------------------------
function logDuration(start: number, action: string) {
  const duration = Date.now() - start;
  CommonLogger.info('Timing', 'REQUEST_DURATION', `${action} - ${duration}ms`);
}

async function withTimeout<T>(maybePromise: T | Promise<T>, ms: number): Promise<T> {
  const promise = maybePromise instanceof Promise ? maybePromise : Promise.resolve(maybePromise);
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout de ${ms}ms`)), ms))]);
}

function toLambdaResponse(id: string, statusCode: number, message: string, body?: any): LambdaResponse {
  return { id, statusCode, message, body };
}
