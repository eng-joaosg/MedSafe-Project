import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from './app.module';
import { ulid } from 'ulid';
import { ConfigService } from '@nestjs/config';
import { CommonLogger } from './common/logger/common.logger';
import { RequestContextService } from './common/request-context/request-context.service';
import { AppException, InvalidApiKeyError, ServerError, UnknownActionError } from './common/exceptions/app.exception';
import { FindEmailClientUserHandler } from './presentation/handlers/client-user/find-email-client-user.handler';
import { RegisterClientUserHandler } from './presentation/handlers/client-user/register-client-user.handler';
import { VerifyAccountClientUserHandler } from './presentation/handlers/client-user/verify-account-client-user.handler';
import { LoginClientUserHandler } from './presentation/handlers/client-user/login-client-user.handler';
import {
  RegisterClientUserPayload,
  VerifyAccountClientUserPayload,
  LoginClientUserPayload,
} from './presentation/handlers/client-user/client-user.types';

interface LambdaEvent {
  httpMethod?: string;
  headers?: Record<string, string>;
  body?: string | null;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  isBase64Encoded?: boolean;
  resource?: string;
}

let app: INestApplicationContext | null = null;

export const handler = async (event: LambdaEvent) => {
  const requestId = ulid();
  const isApiGateway = !!event.httpMethod;

  try {
    if (!app) app = await NestFactory.createApplicationContext(AppModule);
    const requestContext = app.get(RequestContextService);

    const rawHeaders = event.headers ?? {};
    const headers: Record<string, string> = Object.fromEntries(Object.entries(rawHeaders).map(([k, v]) => [k.toLowerCase(), v]));

    const finalRequestId = headers['x-request-id'] ?? requestId;
    const initialContext = new Map<string, any>();
    initialContext.set('requestId', finalRequestId);

    return await requestContext.run<Promise<any>>(async () => {
      CommonLogger.setRequestContext(requestContext);
      const configService = app!.get(ConfigService);

      // Validação de API Key apenas para invocação direta
      if (!isApiGateway) {
        const requiredKey = configService.get<string>('AUTH_SERVICE_API_KEY');
        const incomingKey = headers['x-api-key'];
        if (!requiredKey || requiredKey !== incomingKey) {
          CommonLogger.warn('Auth', 'INVALID_API_KEY', 'API Key inválida');
          throw new InvalidApiKeyError();
        }
      }

      // ----------------------------
      // Determina action e body
      // ----------------------------

      const start = Date.now();
      let body: any;
      let statusCode = 200;
      // ----------------------------
      // Dispatcher de actions
      // ----------------------------

      switch (event.resource) {
        case '/client-user/find-email': {
          const handlerInstance = app!.get(FindEmailClientUserHandler);
          const email = event.queryStringParameters?.email;
          body = await withTimeout(handlerInstance.execute(email!), 10000);
          break;
        }

        case '/client-user/register': {
          const handlerInstance = app!.get(RegisterClientUserHandler);
          const payload = event.body ? JSON.parse(event.body) : {};
          body = await withTimeout(handlerInstance.execute(payload as RegisterClientUserPayload), 10000);
          statusCode = 201;
          break;
        }

        case '/client-user/verify-account': {
          const handlerInstance = app!.get(VerifyAccountClientUserHandler);
          const payload = event.body ? JSON.parse(event.body) : {};
          body = await withTimeout(handlerInstance.execute(payload as VerifyAccountClientUserPayload), 10000);
          break;
        }

        case '/client-user/login': {
          const handlerInstance = app!.get(LoginClientUserHandler);
          const payload = event.body ? JSON.parse(event.body) : {};
          body = await withTimeout(handlerInstance.execute(payload as LoginClientUserPayload), 10000);
          break;
        }

        default:
          CommonLogger.warn('Action', 'UNKNOWN', `Ação desconhecida: ${event.resource}`);
          throw new UnknownActionError(event.resource!);
      }

      logDuration(start, event.resource);

      const responsePayload = { id: finalRequestId, message: 'Sucesso', body };
      return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'x-request-id': finalRequestId },
        body: JSON.stringify(responsePayload),
      };
    }, initialContext);
  } catch (err: unknown) {
    let statusCode = 500;
    let message = 'Erro interno desconhecido.';

    if (err instanceof AppException) {
      statusCode = err.getStatus();
      message = err.message;
    } else if (err instanceof ServerError) {
      statusCode = 500;
      message = err.message;
    } else if (err instanceof Error && err.message.includes('Timeout')) {
      statusCode = 504;
      message = 'Serviço demorou demais para responder. Tente novamente mais tarde.';
    } else if (err instanceof Error) {
      CommonLogger.error('Handler', 'UNHANDLED_ERROR', err.message, err.stack);
    }

    const errorPayload = { id: requestId, message };
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json', 'x-request-id': requestId },
      body: JSON.stringify(errorPayload),
    };
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
