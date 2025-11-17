import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientUserService } from './application/services/client-user.service';
import { ApplicationModule } from './application/application.module';
import { RequestContextService } from './common/request-context/context-context.service';
import { ClientUserAuthController } from './presentation/controllers/client-user.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ApplicationModule],
  controllers: [ClientUserAuthController],
  providers: [ClientUserService, RequestContextService],
  exports: [ClientUserService, RequestContextService],
})
export class AppModule {}
