import { Module } from '@nestjs/common';
import { NotificationModule } from '../infrastructure/modules/notification.module';
import { NotificationHandler } from './sqs-notification.handler';

@Module({
  imports: [NotificationModule],
  providers: [NotificationHandler],
  exports: [NotificationHandler],
})
export class NotificationHandlerModule {}
