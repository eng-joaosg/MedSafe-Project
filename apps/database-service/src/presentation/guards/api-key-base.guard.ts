import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuardBase implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly configKey: string,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    const validApiKey = this.configService.get<string>(this.configKey);

    if (!apiKeyHeader || apiKeyHeader !== validApiKey) {
      throw new UnauthorizedException('API key inválida ou ausente.');
    }

    return true;
  }
}
