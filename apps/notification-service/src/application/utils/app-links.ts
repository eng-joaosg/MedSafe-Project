import { ConfigService } from '@nestjs/config';

export class AppLinks {
  constructor(private readonly config: ConfigService) {}

  private get base(): string {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }
  public front = {
    verifyPage: () => `${this.base}/auth/verify-account`,
  };
}
