import { Module } from '@nestjs/common';
import { PublicApplicationModule } from '../../application/modules/public-application.module';
import { PublicAccessAlertHandler } from '../handlers/public/public-access-alert.handler';

@Module({
  imports: [PublicApplicationModule],
  providers: [PublicAccessAlertHandler],
  exports: [PublicAccessAlertHandler],
})
export class PublicModule {}
