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
import { AssociateClinicalInfoHandler } from './presentation/handlers/client-user/associate-clinical-info.handler';
import { ChangeNameClientUserHandler } from './presentation/handlers/client-user/change-name-client-user.handler';
import { ChangePasswordClientUserHandler } from './presentation/handlers/client-user/change-password-client-user.handler';
import { ITokenService } from './domain/services/i-token.service';
import { TOKEN_SERVICE } from './common/utils/tokens.contants';
import {
  RegisterClientUserPayload,
  VerifyAccountClientUserPayload,
  LoginClientUserPayload,
} from './presentation/handlers/client-user/client-user.types';

export interface LambdaEvent {
  httpMethod?: string;
  headers?: Record<string, string>;
  body?: string | null;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  isBase64Encoded?: boolean;
  resource?: string;
}

let app: INestApplicationContext | null = null;
let tokenService: ITokenService;
let configService: ConfigService;

async function getApp(): Promise<INestApplicationContext> {
  if (!app) {
    app = await NestFactory.createApplicationContext(AppModule);
    tokenService = app.get<ITokenService>(TOKEN_SERVICE);
    configService = app.get(ConfigService);
  }
  return app;
}

export const handler = async (event: LambdaEvent) => {
  const requestId = ulid();
  const isApiGateway = !!event.httpMethod;

  const withTimeout = async <T>(maybePromise: T | Promise<T>, ms: number): Promise<T> => {
    const promise = maybePromise instanceof Promise ? maybePromise : Promise.resolve(maybePromise);
    return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout de ${ms}ms`)), ms))]);
  };

  const logDuration = (start: number, action?: string) => {
    const duration = Date.now() - start;
    CommonLogger.info('Timing', 'REQUEST_DURATION', `${action ?? 'unknown'} - ${duration}ms`);
  };

  const validateAuth = async (headers: Record<string, string>) => {
    console.log('---------Validação------------');
    const cookieHeader = headers['cookie'] || headers['Cookie'] || '';
    console.log(cookieHeader);
    if (!cookieHeader || typeof cookieHeader !== 'string') throw new AppException('Usuário não autenticado', 401);

    const cookies: Record<string, string> = {};
    cookieHeader.split(/; */).forEach((pair) => {
      const index = pair.indexOf('=');
      if (index > -1) {
        const key = pair.slice(0, index).trim();
        const value = pair.slice(index + 1).trim();
        cookies[key] = value;
      }
    });

    const token = cookies['auth_token'];
    if (!token) throw new AppException('Usuário não autenticado', 401);

    const payload = await tokenService.verifyToken(token).catch(() => null);
    if (!payload) throw new AppException('Token inválido ou expirado', 401);

    return payload as { sub?: string | number };
  };

  try {
    const appContext = await getApp();
    const requestContext = appContext.get(RequestContextService);
    const rawHeaders = event.headers ?? {};
    const headers: Record<string, string> = Object.fromEntries(Object.entries(rawHeaders).map(([k, v]) => [k.toLowerCase(), v]));
    const finalRequestId = headers['x-request-id'] ?? requestId;
    const initialContext = new Map<string, any>();
    initialContext.set('requestId', finalRequestId);

    return await requestContext.run<Promise<any>>(async () => {
      CommonLogger.setRequestContext(requestContext);

      if (!isApiGateway) {
        const requiredKey = configService.get<string>('AUTH_SERVICE_API_KEY');
        const incomingKey = headers['x-api-key'];
        if (!requiredKey || requiredKey !== incomingKey) throw new InvalidApiKeyError();
      }

      const start = Date.now();
      let body: unknown;
      let statusCode = 200;

      switch (event.resource) {
        case '/client-user/find-email': {
          const handlerInstance = appContext.get(FindEmailClientUserHandler);
          const email = event.queryStringParameters?.email;
          if (!email) throw new AppException('Email não fornecido', 400);
          body = await withTimeout(handlerInstance.execute(email), 10000);
          break;
        }

        case '/client-user/register': {
          const handlerInstance = appContext.get(RegisterClientUserHandler);
          if (!event.body) throw new AppException('Payload não fornecido', 400);
          const payload: RegisterClientUserPayload = JSON.parse(event.body);
          body = await withTimeout(handlerInstance.execute(payload), 10000);
          statusCode = 201;
          break;
        }

        case '/client-user/verify-account': {
          const handlerInstance = appContext.get(VerifyAccountClientUserHandler);
          if (!event.body) throw new AppException('Payload não fornecido', 400);
          const payload: VerifyAccountClientUserPayload = JSON.parse(event.body);
          body = await withTimeout(handlerInstance.execute(payload), 10000);
          break;
        }

        case '/client-user/login': {
          const handlerInstance = appContext.get(LoginClientUserHandler);
          if (!event.body) throw new AppException('Payload não fornecido', 400);
          const payload: LoginClientUserPayload = JSON.parse(event.body);
          console.log(payload);
          body = await withTimeout(handlerInstance.execute(payload), 10000);
          break;
        }

        case '/client-user/associate-clinical-info': {
          console.log('===============================================');
          const handlerInstance = appContext.get(AssociateClinicalInfoHandler);

          const authPayload = await validateAuth(headers);
          console.log(authPayload);
          const userId = authPayload.sub;
          if (!userId || typeof userId !== 'string') {
            throw new AppException('Usuário inválido', 401);
          }

          const clinicalInfoId = event.queryStringParameters?.clinicalInfoId;
          console.log(clinicalInfoId);
          if (!clinicalInfoId || typeof clinicalInfoId !== 'string') {
            throw new AppException('ID das informações clínicas inválido', 400);
          }

          body = await withTimeout(handlerInstance.execute(userId, clinicalInfoId), 10000);
          break;
        }

        case '/client-user/change-name': {
          const handlerInstance = appContext.get(ChangeNameClientUserHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          if (!userId || typeof userId !== 'string') throw new AppException('Usuário inválido', 401);

          const parsedBody: { newFirstName?: unknown; newLastName?: unknown } = event.body ? JSON.parse(event.body) : {};

          const newFirstName = parsedBody.newFirstName;
          const newLastName = parsedBody.newLastName;

          if (typeof newFirstName !== 'string' || typeof newLastName !== 'string') {
            throw new AppException('Novo nome ou sobrenome inválido', 400);
          }

          body = await withTimeout(handlerInstance.execute(userId, newFirstName, newLastName), 10000);
          break;
        }

        case '/client-user/change-password': {
          const handlerInstance = appContext.get(ChangePasswordClientUserHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          if (!userId || typeof userId !== 'string') throw new AppException('Usuário inválido', 401);

          // Parse do body com validação de tipos
          const parsedBody: { password?: unknown; newPassword?: unknown } = event.body ? JSON.parse(event.body) : {};

          const password = parsedBody.password;
          const newPassword = parsedBody.newPassword;

          if (typeof password !== 'string' || typeof newPassword !== 'string') {
            throw new AppException('Senha antiga ou nova inválida', 400);
          }

          body = await withTimeout(handlerInstance.execute(userId, password, newPassword), 10000);
          break;
        }

        default:
          CommonLogger.warn('Action', 'UNKNOWN', `Ação desconhecida: ${event.resource}`);
          throw new UnknownActionError(event.resource!);
      }

      logDuration(start, event.resource);

      return {
        statusCode,
        headers: { 'Content-Type': 'application/json', 'x-request-id': finalRequestId },
        body: JSON.stringify({ id: finalRequestId, message: 'Sucesso', body }),
      };
    }, initialContext);
  } catch (err: unknown) {
    let statusCode = 500;
    let message = 'Erro interno desconhecido.';

    if (err instanceof AppException) {
      statusCode = err.getStatus();
      message = err.message;
    } else if (err instanceof ServerError) {
      message = err.message;
    } else if (err instanceof Error && err.message.includes('Timeout')) {
      statusCode = 504;
      message = 'Serviço demorou demais para responder. Tente novamente mais tarde.';
    } else if (err instanceof Error) {
      CommonLogger.error('Handler', 'UNHANDLED_ERROR', err.message, err.stack);
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json', 'x-request-id': requestId },
      body: JSON.stringify({ id: requestId, message }),
    };
  }
};
