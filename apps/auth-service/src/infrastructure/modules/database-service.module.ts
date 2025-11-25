import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseGateway } from '../gateways/database-service.gateway';
import { DatabaseServiceUrls } from '../../common/utils/database-service.urls';
import { DATABASE_GATEWAY } from '../../common/utils/tokens.contants';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    DatabaseServiceUrls,
    {
      provide: DATABASE_GATEWAY,
      useClass: DatabaseGateway,
    },
  ],
  exports: [DATABASE_GATEWAY],
})
export class DatabaseServiceModule {}
