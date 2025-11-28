import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('--- JWT GUARD DEBUG START ---');
    console.log('Header Authorization (Bearer):', request.headers['authorization']);
    console.log('Header cookie (String bruta):', request.headers.cookie);
    console.log('Objeto request.cookies (Após cookie-parser):', request.cookies);

    const authHeader = request.headers['authorization'];
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.cookies?.auth_token) {
      // lê do cookie seguro
      token = request.cookies.auth_token;
    } else if (request.headers.cookie) {
      const cookieEntries = request.headers.cookie.split(';').map((c) => c.trim());
      const match = cookieEntries.find((c) => c.startsWith('auth_token='));
      if (match) {
        token = match.split('=')[1];
      }
    }

    if (!token) {
      console.log('Resultado: Token NÃO encontrado.');
      throw new UnauthorizedException('Usuário não autenticado: token ausente');
    }

    console.log('Resultado: Token encontrado. Tentando verificar...');

    try {
      this.jwtService.verify(token);
      console.log('Resultado: Token VERIFICADO com sucesso.');
      return true;
    } catch (error) {
      console.error('Erro na Verificação do Token:', error);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
