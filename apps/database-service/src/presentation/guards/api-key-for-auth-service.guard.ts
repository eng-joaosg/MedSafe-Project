import { Injectable } from '@nestjs/common';
import { ApiKeyGuardBase } from './api-key-base.guard';

@Injectable()
export class ApiKeyGuardForAuthService extends ApiKeyGuardBase {
  constructor() {
    super('DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY');
  }
}
