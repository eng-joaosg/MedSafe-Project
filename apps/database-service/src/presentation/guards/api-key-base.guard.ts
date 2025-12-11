import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuardBase implements CanActivate {
  private readonly apiKey: string;

  constructor(configKey: string) {
    const value = process.env[configKey];
    if (!value) {
      throw new Error(`API key não definida: ${configKey}`);
    }
    this.apiKey = value;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader || apiKeyHeader !== this.apiKey) {
      throw new UnauthorizedException('API key inválida ou ausente.');
    }

    return true;
  }
}
