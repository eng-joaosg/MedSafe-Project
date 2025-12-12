import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(private readonly jwtService: JwtService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não definido no ambiente');
    }
    this.jwtSecret = secret;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    let token: string | undefined;

    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.cookies?.auth_token) {
      token = request.cookies.auth_token;
    } else if (request.headers.cookie) {
      const cookieEntries = request.headers.cookie.split(';').map((c) => c.trim());
      const match = cookieEntries.find((c) => c.startsWith('auth_token='));
      if (match) token = match.split('=')[1];
    }

    if (!token) {
      throw new UnauthorizedException('Usuário não autenticado: token ausente');
    }

    try {
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret });
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }
}
