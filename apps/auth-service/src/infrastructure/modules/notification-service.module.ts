import { Module } from '@nestjs/common';
import { RequestContextService } from '../../common/request-context/request-context.service';
import { NotificationGateway } from '../gateways/notification-service.gateway';
import { SqsNotificationService } from '../services/sqs-notification.service';
import { NOTIFICATION_GATEWAY, NOTIFICATION_SERVICE } from '../../common/utils/tokens.contants';

@Module({
  imports: [],
  providers: [
    RequestContextService,
    {
      provide: NOTIFICATION_GATEWAY,
      useClass: NotificationGateway,
    },
    {
      provide: NOTIFICATION_SERVICE,
      useClass: SqsNotificationService,
    },
  ],
  exports: [NOTIFICATION_GATEWAY, NOTIFICATION_SERVICE],
})
export class NotificationServiceModule {}
