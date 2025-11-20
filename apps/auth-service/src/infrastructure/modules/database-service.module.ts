import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseGateway } from '../gateways/database-service.gateway';
import { DatabaseServiceUrls } from '../../common/utils/database-service.urls';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    DatabaseServiceUrls,
    {
      provide: 'IDatabaseGateway',
      useClass: DatabaseGateway,
    },
  ],
  exports: ['IDatabaseGateway'],
})
export class DatabaseServiceModule {}
