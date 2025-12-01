import { Module } from '@nestjs/common';
import { MappingModule } from './mapping.module';
import { ClientUserInfraModule } from '../../infrastructure/modules/client-user-infra.module';
import { FindEmailClientUserUsecase } from '../usecases/client-user/find-email-client-user.usecase';
import { RegisterClientUserUsecase } from '../usecases/client-user/register-client-user.usecase';
import { VerifyAccountClientUserUseCase } from '../usecases/client-user/verify-account-client-user.usecase';
import { ChangePasswordClientUserUseCase } from '../usecases/client-user/change-password-client-user.usecase';
import { LoginClientUserUseCase } from '../usecases/client-user/login-client-user.usecase';
import {
  ASSOCIATE_CLINICAL_INFO_USECASE,
  CHANGE_NAME_CLIENT_USER_USECASE,
  CHANGE_PASSWORD_CLIENT_USER_USECASE,
  DELETE_CLIENT_USER_USECASE,
  FIND_EMAIL_CLIENT_USER_USECASE,
  LOGIN_CLIENT_USER_USECASE,
  REGISTER_CLIENT_USER_USECASE,
  VERIFY_ACCOUNT_CLIENT_USER_USECASE,
} from '../../common/utils/tokens.contants';
import { ChangeNameClientUserUseCase } from '../usecases/client-user/change-name-client-user.usecase';
import { AssociateClinicalInfoUsecase } from '../usecases/client-user/associate-clinical-info.usecase';
import { DeleteClientUserUseCase } from '../usecases/client-user/delete-client-user.usecase';

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
    {
      provide: CHANGE_PASSWORD_CLIENT_USER_USECASE,
      useClass: ChangePasswordClientUserUseCase,
    },
    {
      provide: LOGIN_CLIENT_USER_USECASE,
      useClass: LoginClientUserUseCase,
    },
    {
      provide: CHANGE_NAME_CLIENT_USER_USECASE,
      useClass: ChangeNameClientUserUseCase,
    },
    {
      provide: ASSOCIATE_CLINICAL_INFO_USECASE,
      useClass: AssociateClinicalInfoUsecase,
    },
    {
      provide: DELETE_CLIENT_USER_USECASE,
      useClass: DeleteClientUserUseCase,
    },
  ],
  exports: [
    FIND_EMAIL_CLIENT_USER_USECASE,
    REGISTER_CLIENT_USER_USECASE,
    VERIFY_ACCOUNT_CLIENT_USER_USECASE,
    CHANGE_PASSWORD_CLIENT_USER_USECASE,
    LOGIN_CLIENT_USER_USECASE,
    CHANGE_NAME_CLIENT_USER_USECASE,
    ASSOCIATE_CLINICAL_INFO_USECASE,
    DELETE_CLIENT_USER_USECASE,
  ],
})
export class ClientUserApplicationModule {}
