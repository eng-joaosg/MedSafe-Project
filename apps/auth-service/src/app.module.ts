import { Module } from '@nestjs/common';
import { ClientUserModule } from './presentation/modules/client-user.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { RequestContextService } from './common/request-context/request-context.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ClientUserModule],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class AppModule {}
