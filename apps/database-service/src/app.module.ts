import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { RequestContextService } from './common/request-context/context-context.service';
import { ClientUserAuthController } from './presentation/controllers/client-user.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ApplicationModule],
  controllers: [ClientUserAuthController],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class AppModule {}
