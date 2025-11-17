import { Module } from '@nestjs/common';
import { RequestContextService } from 'src/common/request-context/request-context.service';
import { NotificationGateway } from '../gateways/notification-service.gateway';
import { SqsNotificationService } from '../services/sqs-notification.service';

@Module({
  imports: [],
  providers: [
    RequestContextService,
    {
      provide: 'INotificationGateway',
      useClass: NotificationGateway,
    },
    {
      provide: 'INotificationService',
      useClass: SqsNotificationService,
    },
  ],
  exports: ['INotificationGateway', 'INotificationService'],
})
export class NotificationServiceModule {}
