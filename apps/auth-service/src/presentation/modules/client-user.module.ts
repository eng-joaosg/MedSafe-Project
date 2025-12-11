import { Module } from '@nestjs/common';
import { ClientUserApplicationModule } from '../../application/modules/client-user-application.module';
import { FindEmailClientUserHandler } from '../handlers/client-user/find-email-client-user.handler';
import { RegisterClientUserHandler } from '../handlers/client-user/register-client-user.handler';
import { VerifyAccountClientUserHandler } from '../handlers/client-user/verify-account-client-user.handler';
import { ChangePasswordClientUserHandler } from '../handlers/client-user/change-password-client-user.handler';
import { LoginClientUserHandler } from '../handlers/client-user/login-client-user.handler';
import { ChangeNameClientUserHandler } from '../handlers/client-user/change-name-client-user.handler';
import { AssociateClinicalInfoHandler } from '../handlers/client-user/associate-clinical-info.handler';
import { DeleteClientUserHandler } from '../handlers/client-user/delete-client-user.handler';

@Module({
  imports: [ClientUserApplicationModule],
  providers: [
    FindEmailClientUserHandler,
    RegisterClientUserHandler,
    VerifyAccountClientUserHandler,
    ChangePasswordClientUserHandler,
    LoginClientUserHandler,
    ChangeNameClientUserHandler,
    AssociateClinicalInfoHandler,
    DeleteClientUserHandler,
  ],
  exports: [
    FindEmailClientUserHandler,
    RegisterClientUserHandler,
    VerifyAccountClientUserHandler,
    ChangePasswordClientUserHandler,
    LoginClientUserHandler,
    ChangeNameClientUserHandler,
    AssociateClinicalInfoHandler,
    DeleteClientUserHandler,
  ],
})
export class ClientUserModule {}
