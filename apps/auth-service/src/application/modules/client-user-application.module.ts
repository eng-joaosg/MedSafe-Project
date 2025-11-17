import { Module } from '@nestjs/common';
import { FindEmailClientUserUsecase } from '../usecases/client-user/find-email-client-user.usecase';
import { RegisterClientUserUsecase } from '../usecases/client-user/register-client-user.usecase';
import { MappingModule } from './mapping.module';
import { ClientUserInfraModule } from '../../infrastructure/modules/client-user-infra.module';

@Module({
  imports: [ClientUserInfraModule, MappingModule],
  providers: [RegisterClientUserUsecase, FindEmailClientUserUsecase],
  exports: [FindEmailClientUserUsecase, RegisterClientUserUsecase],
})
export class ClientUserApplicationModule {}
