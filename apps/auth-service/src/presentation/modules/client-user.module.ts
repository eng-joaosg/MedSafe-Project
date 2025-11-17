import { Module } from '@nestjs/common';
import { ClientUserApplicationModule } from 'src/application/modules/client-user-application.module';
import { FindEmailClientUserController } from '../controllers/client-user/find-email-client-user.controller';

@Module({
  imports: [ClientUserApplicationModule],
  controllers: [FindEmailClientUserController],
  providers: [],
})
export class ClientUserModule {}
