import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './controllers/gateway.controller';
import { ServicesConfig } from './services/service-config';
import { AuthModule } from './auth/auth.module';
import { AuthServiceInvoker } from './services/auth-service.invoker';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  controllers: [GatewayController],
  providers: [ServicesConfig, AuthServiceInvoker],
})
export class AppModule {}
