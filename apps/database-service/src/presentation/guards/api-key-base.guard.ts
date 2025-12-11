import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretsManagerClient, GetSecretValueCommand, GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class ApiKeyGuardBase implements CanActivate {
  private apiKey?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly configKey: string,
  ) {}

  private async loadApiKey(): Promise<void> {
    if (this.apiKey) return;

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (isProduction) {
      const secretName = '/prod/database-service-full';
      const region = 'sa-east-1';
      const client = new SecretsManagerClient({ region });

      try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response: GetSecretValueCommandOutput = await client.send(command);

        if (!response.SecretString) throw new Error(`Secret ${secretName} vazio`);
        const secretStr: string = response.SecretString;
        const secretObj = JSON.parse(secretStr) as { DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY: string };

        if (!secretObj.DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY) {
          throw new Error(`API key não encontrada no secret ${secretName}`);
        }

        this.apiKey = secretObj.DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY;
      } catch {
        throw new UnauthorizedException('Falha ao obter API key do Secrets Manager');
      }
    } else {
      const key = this.configService.get<string>(this.configKey);
      if (!key) throw new Error(`API key não definida no ambiente dev`);
      this.apiKey = key;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.loadApiKey();

    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader || apiKeyHeader !== this.apiKey) {
      throw new UnauthorizedException('API key inválida ou ausente.');
    }

    return true;
  }
}
