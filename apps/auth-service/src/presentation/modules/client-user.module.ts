import { Module } from '@nestjs/common';
import { ClientUserApplicationModule } from 'src/application/modules/client-user-application.module';
import { FindEmailClientUserHandler } from '../handlers/client-user/find-email-client-user.handler';
import { RegisterClientUserHandler } from '../handlers/client-user/register-client-user.handler';

@Module({
  imports: [ClientUserApplicationModule],
  providers: [FindEmailClientUserHandler, RegisterClientUserHandler],
  exports: [FindEmailClientUserHandler, RegisterClientUserHandler],
})
export class ClientUserModule {}
