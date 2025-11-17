import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from './token-payload';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

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

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

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
