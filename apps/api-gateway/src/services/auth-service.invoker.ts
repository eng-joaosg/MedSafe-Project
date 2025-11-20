import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { LambdaClient, InvokeCommand, InvokeCommandOutput } from '@aws-sdk/client-lambda';
import { Injectable } from '@nestjs/common';
import { ServicesConfig } from './service-config';
import { LambdaEvent } from './types';

export interface GatewayResponse<T = unknown> {
  statusCode: number;
  body: T;
}

@Injectable()
export class AuthServiceInvoker {
  private lambda: LambdaClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly servicesConfig: ServicesConfig,
  ) {
    this.lambda = new LambdaClient({ region: this.servicesConfig.awsRegion });
  }

  async invoke<T = unknown>(action: string, payload: Record<string, any>, requestId: string): Promise<GatewayResponse<T>> {
    const headers = {
      'x-api-key': this.servicesConfig.authServiceApiKey,
      'x-request-id': requestId,
    };

    const event: LambdaEvent = {
      requestId,
      headers,
      action,
      body: payload ?? {},
    };

    let lambdaRes: GatewayResponse<T>;

    if (process.env.NODE_ENV === 'production') {
      const command = new InvokeCommand({
        FunctionName: this.servicesConfig.authServiceLambdaName,
        Payload: Buffer.from(JSON.stringify(event)),
      });

      const response: InvokeCommandOutput = await this.lambda.send(command);

      if (!response.Payload) throw new Error('Lambda não retornou Payload');

      const decoded = new TextDecoder().decode(response.Payload as Uint8Array);
      lambdaRes = JSON.parse(decoded) as GatewayResponse<T>;
    } else {
      const observable$ = this.httpService
        .post(`${this.servicesConfig.authServiceUrl}`, event, { headers })
        .pipe(map((res) => res.data as GatewayResponse<T>));

      lambdaRes = await lastValueFrom(observable$);
    }

    return this.normalizeResponse(lambdaRes);
  }

  private normalizeResponse<T>(res: GatewayResponse<T>): GatewayResponse<T> {
    if (typeof res.body === 'string') {
      try {
        res.body = JSON.parse(res.body) as T;
      } catch {
        // mantém string se não for JSON válido
      }
    }
    return res;
  }
}
