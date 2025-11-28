import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './controllers/gateway.controller';
import { ServicesConfig } from './services/service-config';
import { AuthServiceInvoker } from './services/auth-service.invoker';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [GatewayController],
  providers: [ServicesConfig, AuthServiceInvoker],
})
export class AppModule {}
