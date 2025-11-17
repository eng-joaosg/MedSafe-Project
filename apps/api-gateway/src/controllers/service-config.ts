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
}
