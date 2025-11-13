import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requiredKey = this.configService.get<string>('AUTH_SERVICE_API_KEY');
    const incomingKey = request.headers['x-api-key'];

    if (!requiredKey || requiredKey !== incomingKey) {
      throw new UnauthorizedException(
        'Chave de API inválida ou ausente. Acesso negado.',
      );
    }
    return true;
  }
}
