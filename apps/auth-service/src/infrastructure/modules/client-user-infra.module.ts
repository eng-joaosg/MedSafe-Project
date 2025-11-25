import { Module, Global } from '@nestjs/common';
import { RequestContextService } from '../../common/request-context/request-context.service';
import { DatabaseServiceModule } from './database-service.module';
import { HashServiceModule } from './hash-service.module';
import { NotificationServiceModule } from './notification-service.module';
import { VerificationCodeServiceModule } from './verification-code-service.module';
import { ClientUserRepository } from '../repositories/client-user.repository';
import { MappingModule } from '../../application/modules/mapping.module';
import { CLIENT_USER_REPOSITORY } from '../../common/utils/tokens.contants';
import { TokenServiceModule } from './token-service.module';

@Global()
@Module({
  imports: [
    DatabaseServiceModule,
    HashServiceModule,
    NotificationServiceModule,
    VerificationCodeServiceModule,
    MappingModule,
    TokenServiceModule,
  ],
  providers: [
    RequestContextService,
    {
      provide: CLIENT_USER_REPOSITORY,
      useClass: ClientUserRepository,
    },
  ],
  exports: [
    CLIENT_USER_REPOSITORY,
    RequestContextService,
    DatabaseServiceModule,
    HashServiceModule,
    NotificationServiceModule,
    VerificationCodeServiceModule,
    MappingModule,
    TokenServiceModule,
  ],
})
export class ClientUserInfraModule {}
