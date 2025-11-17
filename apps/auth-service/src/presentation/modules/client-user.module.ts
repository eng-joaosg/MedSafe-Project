import { Module } from '@nestjs/common';
import { ClientUserApplicationModule } from 'src/application/modules/client-user-application.module';
import { FindEmailClientUserController } from '../controllers/client-user/find-email-client-user.controller';
import { RegisterClientUserController } from '../controllers/client-user/register-client-user.controller';

@Module({
  imports: [ClientUserApplicationModule],
  controllers: [FindEmailClientUserController, RegisterClientUserController],
  providers: [],
})
export class ClientUserModule {}
