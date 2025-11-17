import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseGateway } from '../gateways/database-service.gateway';
import { DatabaseServiceUrls } from 'src/common/utils/database-service.urls';
import { RequestContextService } from 'src/common/request-context/request-context.service';

@Global()
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [DatabaseGateway, DatabaseServiceUrls, RequestContextService],
  exports: [DatabaseGateway, RequestContextService],
})
export class DatabaseServiceModule {}
