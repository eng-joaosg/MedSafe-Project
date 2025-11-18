import { Module } from '@nestjs/common';
import { MappingModule } from './mapping.module';
import { ClientUserInfraModule } from '../../infrastructure/modules/client-user-infra.module';
import { FIND_EMAIL_CLIENT_USER_USECASE, REGISTER_CLIENT_USER_USECASE } from '../../common/utils/tokens.contants';
import { FindEmailClientUserUsecase } from '../usecases/client-user/find-email-client-user.usecase';
import { RegisterClientUserUsecase } from '../usecases/client-user/register-client-user.usecase';

@Module({
  imports: [ClientUserInfraModule, MappingModule],
  providers: [
    {
      provide: FIND_EMAIL_CLIENT_USER_USECASE,
      useClass: FindEmailClientUserUsecase,
    },
    {
      provide: REGISTER_CLIENT_USER_USECASE,
      useClass: RegisterClientUserUsecase,
    },
  ],
  exports: [FIND_EMAIL_CLIENT_USER_USECASE, REGISTER_CLIENT_USER_USECASE],
})
export class ClientUserApplicationModule {}
