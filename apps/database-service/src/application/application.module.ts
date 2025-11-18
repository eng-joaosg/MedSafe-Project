import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ClientUserService } from './services/client-user.service';
import { KnexClientUserRepository } from '../database/repositories/knex-client-user.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ClientUserService,
    {
      provide: 'IClientUserRepository',
      useClass: KnexClientUserRepository,
    },
  ],
  exports: [ClientUserService, 'IClientUserRepository'],
})
export class ApplicationModule {}
