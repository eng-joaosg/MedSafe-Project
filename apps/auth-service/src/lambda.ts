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
import { RefreshTokenHandler } from './presentation/handlers/user/refresh-token.handler';
import { ChangePasswordClientUserHandler } from './presentation/handlers/client-user/change-password-client-user.handler';
import { ITokenService } from './domain/services/i-token.service';
import { TOKEN_SERVICE } from './common/utils/tokens.contants';
import { SessionDto } from './application/dtos/client-user/session.dto';
import { VerifyPasswordHandler } from './presentation/handlers/user/verify-password.handler';
import { NewVerificationCodeHandler } from './presentation/handlers/user/new-verification-code.handler';
import { DeleteClientUserHandler } from './presentation/handlers/client-user/delete-client-user.handler';
import { ResetPasswordDto } from './application/dtos/user/reset-password.dto';
import { ResetPasswordHandler } from './presentation/handlers/user/resete-password.handler';
import { PublicAccessAlertHandler } from './presentation/handlers/public/public-access-alert.handler';
import {
  RegisterClientUserPayload,
  VerifyAccountClientUserPayload,
  LoginClientUserPayload,
} from './presentation/handlers/client-user/client-user.types';

export interface LambdaEvent {
  httpMethod?: string;
  resource?: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  isBase64Encoded?: boolean;
  headers?: Record<string, string>;
  body?: string | null;
  version?: string;
  routeKey?: string;
  rawPath?: string;
  rawQueryString?: string;
  requestContext?: {
    http?: {
      method?: string;
      path?: string;
      protocol?: string;
      sourceIp?: string;
      userAgent?: string;
    };
  };
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

// ================= Funções auxiliares =================
function lambdaResponse(body: unknown, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': configService.get('CORS_ORIGIN') ?? 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    },
    body: body != null ? JSON.stringify(body) : '',
  };
}

function lambdaResponseWithCookie(body: unknown, token: string, maxAgeSeconds: number = 60 * 60 * 2, statusCode: number = 200) {
  const cookie = `auth_token=${token}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=${maxAgeSeconds}`;
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': configService.get('CORS_ORIGIN') ?? 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
    },
    multiValueHeaders: {
      'Set-Cookie': [cookie],
    },
    body: body != null ? JSON.stringify(body) : '',
  };
}

export const handler = async (event: LambdaEvent) => {
  const requestId = ulid();
  const isApiGateway = !!event.httpMethod || !!event.requestContext?.http?.method;
  const withTimeout = async <T>(maybePromise: T | Promise<T>, ms: number): Promise<T> => {
    const promise = maybePromise instanceof Promise ? maybePromise : Promise.resolve(maybePromise);
    return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout de ${ms}ms`)), ms))]);
  };
  const logDuration = (start: number, action?: string) => {
    const duration = Date.now() - start;
    CommonLogger.info('Timing', 'REQUEST_DURATION', `${action ?? 'unknown'} - ${duration}ms`);
  };

  const validateAuth = async (headers: Record<string, string>) => {
    const cookieHeader = headers['cookie'] || headers['Cookie'] || '';
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

    return payload as { sub: string | number; role: string };
  };

  try {
    const appContext = await getApp();
    const requestContext = appContext.get(RequestContextService);
    const rawHeaders = event.headers ?? {};
    const headers: Record<string, string> = Object.fromEntries(Object.entries(rawHeaders).map(([k, v]) => [k.toLowerCase(), v]));
    const finalRequestId = headers['x-request-id'] ?? requestId;
    const initialContext = new Map<string, any>();
    initialContext.set('requestId', finalRequestId);
    const timeout = 30000;

    // ======== Tratamento global de CORS OPTIONS ========
    if ((event.httpMethod ?? event.requestContext?.http?.method)?.toUpperCase() === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': configService.get('CORS_ORIGIN') ?? 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        },
        body: '',
      };
    }

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
      const route = event.resource ?? event.rawPath ?? event.routeKey;
      switch (route) {
        // ================= LOGIN =================
        case '/production/auth/client-user/login': {
          const handlerInstance = appContext.get(LoginClientUserHandler);
          if (!event.body) throw new AppException('Payload não fornecido', 400);
          const payload: LoginClientUserPayload = JSON.parse(event.body);

          const session: SessionDto | null = await withTimeout(handlerInstance.execute(payload), timeout);

          if (!session) {
            throw new AppException('AuthService não retornou body no login', 500);
          }

          if (!session.accessToken?.accessToken) {
            throw new AppException('Login falhou: token não recebido', 500);
          }

          const { accessToken, ...sessionWithoutToken } = session;

          logDuration(start, route);

          return lambdaResponseWithCookie(sessionWithoutToken, accessToken.accessToken);
        }

        // ================= LOGOUT =================
        case '/production/auth/logout': {
          CommonLogger.info('AUTH-SERVICE', 'LOGOUT', '');
          return lambdaResponseWithCookie({ message: 'Logout realizado' }, '', 0);
        }

        // ================= REFRESH TOKEN =================
        case '/production/auth/refresh-token': {
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          const role = authPayload.role;
          const handlerInstance = appContext.get(RefreshTokenHandler);
          const session: SessionDto = await withTimeout(handlerInstance.execute(userId, role), timeout);
          const { accessToken, ...sessionWithoutToken } = session;

          logDuration(start, route);
          return lambdaResponseWithCookie(sessionWithoutToken, accessToken.accessToken, 7200);
        }

        // ================= DELETE ACCOUNT =================
        case '/production/auth/client-user/delete-account': {
          const handlerInstance = appContext.get(DeleteClientUserHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          const parsedBody: { password: string } = event.body ? JSON.parse(event.body) : {};
          const password = parsedBody.password;
          await withTimeout(handlerInstance.execute(userId.toString(), password), timeout);
          logDuration(start, route);
          return lambdaResponseWithCookie({ message: 'Logout realizado' }, '', 0);
        }

        // ================= REFRESH TOKEN =================
        case '/production/auth/new-verification-code': {
          const handlerInstance = appContext.get(NewVerificationCodeHandler);
          const parsedBody: { email: string } = event.body ? JSON.parse(event.body) : {};
          const email = parsedBody.email;
          const type = (event.queryStringParameters?.type ?? 'verify-account') as 'verify-account' | 'forgot-password';
          await withTimeout(handlerInstance.execute(email, type), timeout);
          logDuration(start, route);
          return lambdaResponse('');
        }

        // ================= REFRESH TOKEN =================
        case '/production/auth/reset-password': {
          const handlerInstance = appContext.get(ResetPasswordHandler);
          const parsedBody: ResetPasswordDto = event.body ? JSON.parse(event.body) : {};
          await withTimeout(handlerInstance.execute(parsedBody), timeout);
          logDuration(start, route);
          return lambdaResponse('');
        }

        // ================= VERIFY PASSWORD =================
        case '/production/auth/verify-password': {
          const handlerInstance = appContext.get(VerifyPasswordHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          const parsedBody: { password: string } = event.body ? JSON.parse(event.body) : {};
          const password = parsedBody.password;
          const result: boolean = await withTimeout(handlerInstance.execute(userId.toString(), password), timeout);

          logDuration(start, route);
          return lambdaResponse({ verified: result });
        }
        // ================= CHANGE NAME =================
        case '/production/auth/client-user/change-name': {
          const handlerInstance = appContext.get(ChangeNameClientUserHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          const parsedBody: { newFirstName: string; newLastName: string } = event.body ? JSON.parse(event.body) : {};
          const newFirstName = parsedBody.newFirstName;
          const newLastName = parsedBody.newLastName;

          const session: SessionDto = await withTimeout(handlerInstance.execute(userId.toString(), newFirstName, newLastName), timeout);
          const { accessToken, ...sessionWithoutToken } = session;

          logDuration(start, route);
          return lambdaResponseWithCookie(sessionWithoutToken, accessToken.accessToken, 7200);
        }

        // ================= CHANGE PASSWORD =================
        case '/production/auth/change-password': {
          const handlerInstance = appContext.get(ChangePasswordClientUserHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;
          const parsedBody: { password: string; newPassword: string } = event.body ? JSON.parse(event.body) : {};
          const password = parsedBody.password;
          const newPassword = parsedBody.newPassword;

          const session: SessionDto = await withTimeout(handlerInstance.execute(userId.toString(), password, newPassword), timeout);

          const { accessToken } = session;

          logDuration(start, route);
          return lambdaResponseWithCookie(null, accessToken?.accessToken ?? '', 7200, 200);
        }

        // ================= FIND EMAIL =================
        case '/production/auth/client-user/find-email': {
          const handlerInstance = appContext.get(FindEmailClientUserHandler);
          const email = event.queryStringParameters?.email as string;
          body = await withTimeout(handlerInstance.execute(email), timeout);
          logDuration(start, route);
          return lambdaResponse(body);
        }

        // ================= REGISTER =================
        case '/production/auth/client-user/register': {
          CommonLogger.info('AUTH-SERVICE', 'REGISTER_CLIENT_USER EVENT', event);
          const handlerInstance = appContext.get(RegisterClientUserHandler);
          const payload: RegisterClientUserPayload = event.body ? JSON.parse(event.body) : ({} as RegisterClientUserPayload);
          body = await withTimeout(handlerInstance.execute(payload), timeout);
          statusCode = 201;
          logDuration(start, route);
          return lambdaResponse(body, statusCode);
        }

        // ================= VERIFY ACCOUNT =================
        case '/production/auth/client-user/verify-account': {
          const handlerInstance = appContext.get(VerifyAccountClientUserHandler);
          const payload: VerifyAccountClientUserPayload = event.body ? JSON.parse(event.body) : ({} as VerifyAccountClientUserPayload);
          body = await withTimeout(handlerInstance.execute(payload), timeout);
          logDuration(start, route);
          return lambdaResponse(body);
        }

        // ================= ASSOCIATE CLINICAL INFO =================
        case '/production/auth/client-user/associate-clinical-info': {
          const handlerInstance = appContext.get(AssociateClinicalInfoHandler);
          const authPayload = await validateAuth(headers);
          const userId = authPayload.sub;

          const clinicalInfoId = event.queryStringParameters?.clinicalInfoId as string;
          const session: SessionDto = await withTimeout(handlerInstance.execute(userId.toString(), clinicalInfoId), timeout);

          if (!session?.accessToken?.accessToken) {
            throw new AppException('Falha ao atualizar o token após associar informações clínicas', 500);
          }

          const { accessToken, ...sessionWithoutToken } = session;

          logDuration(start, route);

          return lambdaResponseWithCookie(sessionWithoutToken, accessToken.accessToken, 7200);
        }

        // ================= PUBLIC ACCESS ALERT =================
        case '/production/auth/clinical-info-access-alert': {
          const handlerInstance = appContext.get(PublicAccessAlertHandler);
          const id = event.queryStringParameters?.id;
          if (!id) {
            throw new AppException('ID não fornecido', 400);
          }
          body = await withTimeout(handlerInstance.execute(id), timeout);

          logDuration(start, route);
          return lambdaResponse(body);
        }

        default:
          throw new UnknownActionError(route ?? 'undefined');
      }
    }, initialContext);
  } catch (err: unknown) {
    let statusCode = 500;
    let message = 'Erro interno desconhecido.';
    if (err instanceof AppException) {
      statusCode = err.getStatus();
      message = err.message;
      CommonLogger.warn('Handler', `APP_EXCEPTION_${statusCode}`, message);
    } else if (err instanceof Error && err.message.includes('Timeout')) {
      statusCode = 504;
      message = 'Serviço demorou demais para responder. Tente novamente mais tarde.';
      CommonLogger.error('Handler', 'TIMEOUT', 'Operação excedeu o tempo limite.', err.stack);
    } else if (err instanceof ServerError) {
      message = err.message;
      CommonLogger.error('Handler', 'SERVER_ERROR', err.message, err.stack);
    } else if (err instanceof Error) {
      CommonLogger.error('Handler', 'UNHANDLED_ERROR', err.message, err.stack);
    }
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
      },
      body: JSON.stringify({ id: requestId, message }),
    };
  }
};
