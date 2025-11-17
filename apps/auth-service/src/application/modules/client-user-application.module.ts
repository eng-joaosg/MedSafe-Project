import { Module } from '@nestjs/common';
import { FindEmailClientUserUsecase } from '../usecases/client-user/find-email-client-user.usecase';
import { ClientUserMapper } from '../mapping/client-user.mapper';
import { DatabaseServiceModule } from 'src/infrastructure/modules/database-service.module';
import { ClientUserRepository } from 'src/infrastructure/repositories/client-user.repository';

@Module({
  imports: [DatabaseServiceModule],
  providers: [
    FindEmailClientUserUsecase,
    ClientUserMapper,
    {
      provide: 'IClientUserRepository',
      useClass: ClientUserRepository,
    },
  ],
  exports: [FindEmailClientUserUsecase, 'IClientUserRepository'],
})
export class ClientUserApplicationModule {}
