import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';
import { ServicesConfig } from './service-config';

export interface GatewayResponse<T = unknown> {
  statusCode: number;
  body: T;
  headers?: Record<string, string | string[]>;
}

@Injectable()
export class AuthServiceInvoker {
  constructor(
    private readonly httpService: HttpService,
    private readonly servicesConfig: ServicesConfig,
  ) {}

  /**
   * Invoca o serviço Auth local enviando o objeto `event` exatamente como a AWS Lambda receberia do API Gateway.
   */
  async invoke<T = unknown>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
    payload: any,
    requestId: string,
    authorization?: string,
    cookieHeader?: string,
    queryParams?: Record<string, string | number | boolean>,
  ): Promise<GatewayResponse<T>> {
    const normalizedPath = path.replace(/\/$/, '');

    // ======== Headers ========
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (authorization) {
      headers['Authorization'] = authorization.startsWith('Bearer ') ? authorization : `Bearer ${authorization}`;
    }
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }

    // ======== Monta o evento como AWS Lambda ========
    const event: any = {
      resource: normalizedPath,
      path: normalizedPath,
      httpMethod: method,
      headers,
      pathParameters: {},
      stageVariables: null,
      requestContext: {
        requestId,
        http: {
          method,
          path: normalizedPath,
          sourceIp: '127.0.0.1',
          userAgent: headers['user-agent'] ?? 'local-client',
        },
      },
      body: method !== 'GET' ? JSON.stringify(payload ?? {}) : null,
      queryStringParameters: queryParams ? Object.fromEntries(Object.entries(queryParams).map(([k, v]) => [k, String(v)])) : undefined,
      isBase64Encoded: false,
    };

    // ======== Faz a chamada POST para o Lambda local ========
    const observable$ = this.httpService
      .post(`${this.servicesConfig.authServiceUrl}`, event, { headers })
      .pipe(map((res) => res.data as GatewayResponse<T>));

    const lambdaRes = await lastValueFrom(observable$);

    return this.normalizeResponse(lambdaRes);
  }

  private normalizeResponse<T>(res: GatewayResponse<T>): GatewayResponse<T> {
    if (typeof res.body === 'string') {
      try {
        res.body = JSON.parse(res.body) as T;
      } catch {
        // mantém string caso não seja JSON
      }
    }
    return res;
  }
}
