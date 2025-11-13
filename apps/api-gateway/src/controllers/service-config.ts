import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServicesConfig {
  constructor(private readonly config: ConfigService) {}

  get authServiceUrl(): string {
    return this.config.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3002');
  }

  get authServiceApiKey(): string {
    return this.config.get<string>('AUTH_SERVICE_API_KEY', '');
  }
}
