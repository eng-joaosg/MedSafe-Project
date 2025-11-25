import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ClientUserService } from './services/client-user.service';
import { KnexClientUserRepository } from '../database/repositories/knex-client-user.repository';
import { CLIENT_USER_REPOSITORY, CLIENT_USER_SERVICE } from '../common/contants/tokens.contants';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: CLIENT_USER_SERVICE,
      useClass: ClientUserService,
    },
    {
      provide: CLIENT_USER_REPOSITORY,
      useClass: KnexClientUserRepository,
    },
  ],
  exports: [CLIENT_USER_SERVICE, CLIENT_USER_REPOSITORY],
})
export class ApplicationModule {}
