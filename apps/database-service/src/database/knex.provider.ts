import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import knexConfig from './knex.config';
import { KNEX_CONNECTION } from '../common/contants/tokens.contants';

export const KnexProvider: Provider = {
  provide: KNEX_CONNECTION,
  useFactory: (configService: ConfigService): Knex => {
    const config = knexConfig(configService);
    return knex(config);
  },
  inject: [ConfigService],
};
