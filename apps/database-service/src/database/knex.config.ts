import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { CommonLogger } from '../common/common-logger';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export default async (configService: ConfigService): Promise<Knex.Config> => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const serviceName = 'Knex';

  const safeMessage = (msg: unknown): string | object =>
    typeof msg === 'string' || (typeof msg === 'object' && msg !== null) ? msg : String(msg);

  let dbConnectionString: string;

  if (isProduction) {
    const secretName = '/prod/database-service-full';
    const region = 'sa-east-1';
    const client = new SecretsManagerClient({ region });

    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await client.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret ${secretName} has no SecretString`);
      }
      const secretString: string = response.SecretString;
      const secret = JSON.parse(secretString) as { DB_CONNECTION_STRING: string; JWT_SECRET?: string };

      dbConnectionString = secret.DB_CONNECTION_STRING;
    } catch (error) {
      CommonLogger.error(serviceName, 'DB_ERROR', 'Failed to get DB secret', safeMessage(error));
      throw error;
    }
  } else {
    dbConnectionString = configService.get<string>('DB_CONNECTION_STRING')!;
  }

  return {
    client: 'pg',
    connection: isProduction ? { connectionString: dbConnectionString, ssl: { rejectUnauthorized: false } } : dbConnectionString,
    pool: {
      min: 2,
      max: 10,
    },
    log: {
      error: (message: unknown) => CommonLogger.error(serviceName, 'DB_ERROR', 'Database error', safeMessage(message)),
      warn: (message: unknown) => CommonLogger.warn(serviceName, 'DB_WARN', safeMessage(message)),
      deprecate: (message: unknown) => CommonLogger.warn(serviceName, 'DB_DEPRECATED', safeMessage(message)),
      debug: (message: unknown) => {
        if (!isProduction) CommonLogger.info(serviceName, 'DB_DEBUG', safeMessage(message));
      },
    },
  };
};
