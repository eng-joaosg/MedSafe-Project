import { ConfigService } from '@nestjs/config';

export class AppLinks {
  private static configService: ConfigService;

  static init(configService: ConfigService) {
    this.configService = configService;
  }

  static get VERIFY_EMAIL(): string {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return `${baseUrl}/auth/verify-account`;
  }
}
