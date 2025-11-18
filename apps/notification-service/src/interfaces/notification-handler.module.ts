import { Module } from '@nestjs/common';
import { NotificationHandler } from './sqs-notification.handler';
import { NotificationModule } from 'src/infrastructure/modules/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [NotificationHandler],
  exports: [NotificationHandler],
})
export class NotificationHandlerModule {}
