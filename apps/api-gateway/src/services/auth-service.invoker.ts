import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';
import { ServicesConfig } from './service-config';

export interface GatewayResponse<T = unknown> {
  statusCode: number;
  body: T | null; // corrigido para permitir null
  headers?: Record<string, string | string[]>;
  multiValueHeaders?: Record<string, string[]>;
  cookies?: string[];
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
    rawPath: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
    payload: any,
    requestId: string,
    authorization?: string,
    cookieHeader?: string,
    queryParams?: Record<string, string | number | boolean>,
  ): Promise<GatewayResponse<T>> {
    const normalizedPath = rawPath.replace(/\/$/, '');

    // ======== Headers ========
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (authorization) {
      headers['Authorization'] = authorization.startsWith('Bearer ') ? authorization : `Bearer ${authorization}`;
    }
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }

    const event: any = {
      resource: normalizedPath,
      rawPath: normalizedPath,
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

    const observable$ = this.httpService
      .post(`${this.servicesConfig.authServiceUrl}`, event, { headers })
      .pipe(map((res) => res.data as GatewayResponse<T>));

    const lambdaRes = await lastValueFrom(observable$);

    let finalResponse: GatewayResponse<T>;
    try {
      const bodyParsed = lambdaRes.body ? JSON.parse(lambdaRes.body as string) : null;

      if (bodyParsed && typeof bodyParsed.statusCode === 'number') {
        finalResponse = {
          statusCode: bodyParsed.statusCode,
          body: bodyParsed.body ?? null,
          headers: lambdaRes.headers,
          multiValueHeaders: lambdaRes.multiValueHeaders,
          cookies: lambdaRes.cookies,
        };
      } else {
        finalResponse = lambdaRes;
      }
    } catch {
      finalResponse = lambdaRes;
    }

    return this.normalizeResponse(finalResponse);
  }

  private normalizeResponse<T>(res: GatewayResponse<T>): GatewayResponse<T> {
    const normalizedHeaders: Record<string, string | string[]> = {};
    if (res.headers) {
      Object.assign(normalizedHeaders, res.headers);
    }
    if (res.multiValueHeaders) {
      for (const [key, values] of Object.entries(res.multiValueHeaders)) {
        normalizedHeaders[key] = values;
      }
    }
    res.headers = normalizedHeaders;

    return res;
  }
}
