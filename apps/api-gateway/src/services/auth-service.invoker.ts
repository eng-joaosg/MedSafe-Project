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

  async invoke<T = unknown>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH',
    payload: any,
    requestId: string,
    authorization?: string,
  ): Promise<GatewayResponse<T>> {
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (authorization) headers['authorization'] = authorization;

    const event: any = {
      resource: path,
      path,
      httpMethod: method,
      headers,
      multiValueHeaders: null,
      queryStringParameters: method === 'GET' ? payload : null,
      pathParameters: {},
      stageVariables: null,
      requestContext: { requestId },
      body: method !== 'GET' ? JSON.stringify(payload ?? {}) : null,
      isBase64Encoded: false,
    };

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
        //
      }
    }
    return res;
  }
}
