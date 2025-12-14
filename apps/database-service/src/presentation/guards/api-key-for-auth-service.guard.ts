import { Injectable } from '@nestjs/common';
import { ApiKeyGuardBase } from './api-key-base.guard';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class ApiKeyGuardForAuthService extends ApiKeyGuardBase {
  constructor(configService: ConfigService) {
    super('DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY', configService);
  }
}
