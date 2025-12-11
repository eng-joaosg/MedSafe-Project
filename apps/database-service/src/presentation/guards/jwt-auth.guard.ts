import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { SecretsManagerClient, GetSecretValueCommand, GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwtSecret?: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async loadJwtSecret(): Promise<void> {
    if (this.jwtSecret) return;

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (isProduction) {
      const secretName = '/prod/database-service-full';
      const region = 'sa-east-1';
      const client = new SecretsManagerClient({ region });

      try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response: GetSecretValueCommandOutput = await client.send(command);

        if (!response.SecretString) {
          throw new Error(`Secret ${secretName} has no SecretString`);
        }

        // Garantindo que é uma string antes de parsear
        const secretStr: string = response.SecretString;
        const secretObj = JSON.parse(secretStr) as { JWT_SECRET: string };

        if (!secretObj.JWT_SECRET) {
          throw new Error(`JWT_SECRET not found in secret ${secretName}`);
        }

        this.jwtSecret = secretObj.JWT_SECRET;
      } catch {
        throw new UnauthorizedException('Erro ao buscar JWT_SECRET do Secrets Manager');
      }
    } else {
      // Dev: pega do env
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) throw new Error('JWT_SECRET não definido no ambiente de desenvolvimento');
      this.jwtSecret = secret;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.loadJwtSecret();

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
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret! });
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }
}
