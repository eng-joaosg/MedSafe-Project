import { Module } from '@nestjs/common';
import { PublicAccessAlertUseCase } from '../public/public-access-alert.usecase';
import { PUBLIC_ACCESS_ALERT_USECASE } from '../../common/utils/tokens.contants';
import { NotificationServiceModule } from '../../infrastructure/modules/notification-service.module';

@Module({
  imports: [NotificationServiceModule],
  providers: [
    {
      provide: PUBLIC_ACCESS_ALERT_USECASE,
      useClass: PublicAccessAlertUseCase,
    },
  ],
  exports: [PUBLIC_ACCESS_ALERT_USECASE, NotificationServiceModule],
})
export class PublicApplicationModule {}
