import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { CommonLogger } from 'src/common/common-logger';

export default (configService: ConfigService): Knex.Config => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const serviceName = 'Knex';

  const safeMessage = (msg: unknown): string | object =>
    typeof msg === 'string' || (typeof msg === 'object' && msg !== null) ? msg : String(msg);

  return {
    client: 'pg',
    connection: {
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: Number(configService.get<string>('DB_PORT', '5432')),
      user: configService.get<string>('DB_USER', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres'),
      database: configService.get<string>('DB_NAME', 'medsafe'),
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    log: {
      error: (message: unknown) => CommonLogger.error(serviceName, 'DB_ERROR', 'Database error', safeMessage(message)),
      warn: (message: unknown) => CommonLogger.warn(serviceName, 'DB_WARN', safeMessage(message)),
      deprecate: (message: unknown) => CommonLogger.warn(serviceName, 'DB_DEPRECATED', safeMessage(message)),
      debug: (message: unknown) => {
        if (!isProduction) {
          CommonLogger.info(serviceName, 'DB_DEBUG', safeMessage(message));
        }
      },
    },
  };
};
