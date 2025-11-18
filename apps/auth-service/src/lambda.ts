// src/index.ts
import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from './app.module';
import { FindEmailClientUserHandler } from './presentation/handlers/client-user/find-email-client-user.handler';
import { RegisterClientUserHandler } from './presentation/handlers/client-user/register-client-user.handler';
import { FindEmailPayload, RegisterClientUserPayload } from './presentation/handlers/client-user/types';
import { ConfigService } from '@nestjs/config';
import { CommonLogger } from './common/logger/common.logger';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

let app: INestApplicationContext | null = null;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!app) {
    app = await NestFactory.createApplicationContext(AppModule);
  }

  const configService = app.get<ConfigService>(ConfigService);
  const requestId = event.requestContext?.requestId;
  const requiredKey = configService.get<string>('AUTH_SERVICE_API_KEY');
  const incomingKey = event.headers?.['x-api-key'];
  if (!requiredKey || requiredKey !== incomingKey) {
    CommonLogger.warn('Auth', 'INVALID_API_KEY', `[${requestId}] API Key inválida`);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Chave de API inválida ou ausente', requestId }),
    };
  }

  // 🔎 Parse do body
  let payload: FindEmailPayload | RegisterClientUserPayload;
  try {
    payload = event.body ? JSON.parse(event.body) : ({} as any);
  } catch {
    CommonLogger.error('Payload', 'INVALID_JSON', `[${requestId}] JSON parse error`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Payload inválido', requestId }),
    };
  }

  const action: string = (payload as any).action ?? 'unknown';
  const start = Date.now();

  try {
    if (action === 'findEmailClientUser') {
      const handlerInstance = app.get<FindEmailClientUserHandler>(FindEmailClientUserHandler);
      const result = await withTimeout(handlerInstance.execute(payload as FindEmailPayload), 7000);
      logDuration(start, requestId, action);
      return { statusCode: 200, body: JSON.stringify({ result, requestId }) };
    }

    if (action === 'registerClientUser') {
      const handlerInstance = app.get<RegisterClientUserHandler>(RegisterClientUserHandler);
      const result = await withTimeout(handlerInstance.execute(payload as RegisterClientUserPayload), 7000);
      logDuration(start, requestId, action);
      return { statusCode: 200, body: JSON.stringify({ result, requestId }) };
    }

    CommonLogger.warn('Action', 'UNKNOWN', `[${requestId}] ação desconhecida: ${action}`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unknown action', requestId }),
    };
  } catch (err) {
    const duration = Date.now() - start;
    CommonLogger.error('GlobalError', 'UNHANDLED', `[${requestId}] ${action} - ${duration}ms`, err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: action,
        message: err instanceof Error ? err.message : 'Erro desconhecido',
        requestId,
      }),
    };
  }
};

function logDuration(start: number, requestId: string | undefined, action: string) {
  const duration = Date.now() - start;
  CommonLogger.info('Timing', 'REQUEST_DURATION', `[${requestId}] ${action} - ${duration}ms`);
}
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout de ${ms}ms`)), ms))]);
}
