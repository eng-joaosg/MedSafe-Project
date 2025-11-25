import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenPayload } from './token-payload';

function isJwtPayload(decoded: unknown): decoded is TokenPayload {
  if (typeof decoded !== 'object' || decoded === null) return false;
  const obj = decoded as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.clinicalInfo === 'string' &&
    (obj.role === null || typeof obj.role === 'string') &&
    (obj.iat === null || typeof obj.iat === 'number') &&
    (obj.exp === null || typeof obj.exp === 'number')
  );
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    let token: string | undefined;

    // Bearer token
    if (authHeader) {
      const [type, rawToken] = authHeader.split(' ');
      if (type === 'Bearer' && rawToken) {
        token = rawToken;
      }
    }

    // Cookie token
    if (!token) {
      token = request.cookies?.access_token;
    }

    if (!token) {
      throw new UnauthorizedException('Token JWT ausente.');
    }

    try {
      const decoded = this.jwtService.verify(token);

      if (!isJwtPayload(decoded)) {
        throw new UnauthorizedException('Token JWT malformado ou payload inválido.');
      }

      request.user = decoded;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnauthorizedException('Token JWT inválido ou expirado.');
    }
  }
}
