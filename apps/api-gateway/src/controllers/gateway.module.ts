import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { ServicesConfig } from '../services/service-config';

@Module({
  imports: [HttpModule],
  controllers: [GatewayController],
  providers: [ServicesConfig],
})
export class GatewayModule {}
