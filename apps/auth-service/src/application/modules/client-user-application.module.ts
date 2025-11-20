import { Module } from '@nestjs/common';
import { MappingModule } from './mapping.module';
import { ClientUserInfraModule } from '../../infrastructure/modules/client-user-infra.module';
import { FindEmailClientUserUsecase } from '../usecases/client-user/find-email-client-user.usecase';
import { RegisterClientUserUsecase } from '../usecases/client-user/register-client-user.usecase';
import { VerifyAccountClientUserUseCase } from '../usecases/client-user/verify-account-client-user.usecase';
import {
  FIND_EMAIL_CLIENT_USER_USECASE,
  REGISTER_CLIENT_USER_USECASE,
  VERIFY_ACCOUNT_CLIENT_USER_USECASE,
} from '../../common/utils/tokens.contants';

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
    {
      provide: VERIFY_ACCOUNT_CLIENT_USER_USECASE,
      useClass: VerifyAccountClientUserUseCase,
    },
  ],
  exports: [FIND_EMAIL_CLIENT_USER_USECASE, REGISTER_CLIENT_USER_USECASE, VERIFY_ACCOUNT_CLIENT_USER_USECASE],
})
export class ClientUserApplicationModule {}
