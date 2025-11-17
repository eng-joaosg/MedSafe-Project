import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexProvider } from './knex.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [KnexProvider],
  exports: [KnexProvider],
})
export class DatabaseModule {}
