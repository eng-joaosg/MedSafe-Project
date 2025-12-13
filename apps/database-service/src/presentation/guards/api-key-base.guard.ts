import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommonLogger } from '../../common/common-logger';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class ApiKeyGuardBase implements CanActivate {
  private readonly apiKey: string;
  constructor(
    configKey: string,
    private readonly configService: ConfigService,
  ) {
    const value = this.configService.get<string>(configKey);
    if (!value) {
      throw new Error(`API key não definida: ${configKey}`);
    }
    this.apiKey = value;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log('Request Headers:', request.headers);
    const apiKeyHeader = request.headers['x-api-key'] ?? request.headers['X-API-KEY'];

    if (!apiKeyHeader || apiKeyHeader !== this.apiKey) {
      CommonLogger.warn('ApiKeyGuard', 'INVALID_API_KEY', `Rota: ${request.originalUrl}`);
      throw new UnauthorizedException('API key inválida ou ausente.');
    }
    return true;
  }
}
