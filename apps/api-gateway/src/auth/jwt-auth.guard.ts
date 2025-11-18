import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from './token-payload';

function isJwtPayload(decoded: unknown): decoded is TokenPayload {
  if (typeof decoded !== 'object' || decoded === null) return false;
  const obj = decoded as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.clinicalInfo === 'string' &&
    (obj.role === undefined || typeof obj.role === 'string') &&
    (obj.iat === undefined || typeof obj.iat === 'number') &&
    (obj.exp === undefined || typeof obj.exp === 'number')
  );
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest<Request>();

    const authHeader: string = request.headers['authorization'] ?? '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token JWT ausente ou inválido.');
    }

    try {
      const decoded: unknown = this.jwtService.verify(token);
      if (!isJwtPayload(decoded)) {
        throw new UnauthorizedException('Token JWT inválido ou malformado.');
      }
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Token JWT inválido ou expirado.');
    }
  }
}
