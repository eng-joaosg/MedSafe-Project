import { Module, Global } from '@nestjs/common';
import { RequestContextService } from '../../common/request-context/request-context.service';
import { DatabaseServiceModule } from './database-service.module';
import { HashServiceModule } from './hash-service.module';
import { NotificationServiceModule } from './notification-service.module';
import { VerificationCodeServiceModule } from './verification-code-service.module';
import { ClientUserRepository } from '../repositories/client-user.repository';
import { MappingModule } from '../../application/modules/mapping.module';

@Global()
@Module({
  imports: [DatabaseServiceModule, HashServiceModule, NotificationServiceModule, VerificationCodeServiceModule, MappingModule],
  providers: [
    RequestContextService,
    {
      provide: 'IClientUserRepository',
      useClass: ClientUserRepository,
    },
  ],
  exports: [
    'IClientUserRepository',
    RequestContextService,
    DatabaseServiceModule,
    HashServiceModule,
    NotificationServiceModule,
    VerificationCodeServiceModule,
    MappingModule,
  ],
})
export class ClientUserInfraModule {}
