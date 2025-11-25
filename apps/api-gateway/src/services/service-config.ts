import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServicesConfig {
  constructor(private readonly config: ConfigService) {}

  get authServiceUrl(): string {
    return this.config.get<string>('AUTH_SERVICE_URL', '');
  }

  get authServiceApiKey(): string {
    return this.config.get<string>('AUTH_SERVICE_API_KEY', '');
  }

  get awsRegion(): string {
    return this.config.get<string>('AWS_REGION', 'sa-east-1');
  }

  get authServiceLambdaName(): string {
    return this.config.get<string>('AUTH_SERVICE_LAMBDA_NAME', '');
  }
}
