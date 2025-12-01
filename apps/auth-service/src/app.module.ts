import { Module } from '@nestjs/common';
import { ClientUserModule } from './presentation/modules/client-user.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { RequestContextService } from './common/request-context/request-context.service';
import { UserModule } from './presentation/modules/user.module';
import { PublicModule } from './presentation/modules/public.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ClientUserModule, UserModule, PublicModule],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class AppModule {}
