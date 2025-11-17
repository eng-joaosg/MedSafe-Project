import { Module } from '@nestjs/common';
import { MailerModule } from './mailer.module';
import { SendAccountCreatedEmailUseCase } from '../../application/usecases/send-account-created-email.usecase';
import { SendPublicDataAccessAlertEmailUseCase } from '../../application/usecases/send-public-data-access-alert-email.usecase';
import { SendVerificationEmailUseCase } from '../../application/usecases/send-verification-email.usecase';
import { SendPasswordRecoveryEmailUseCase } from '../../application/usecases/send-password-recovery-email.usecase';

@Module({
  imports: [MailerModule],
  providers: [
    SendVerificationEmailUseCase,
    SendAccountCreatedEmailUseCase,
    SendPasswordRecoveryEmailUseCase,
    SendPublicDataAccessAlertEmailUseCase,
  ],
  exports: [
    SendVerificationEmailUseCase,
    SendAccountCreatedEmailUseCase,
    SendPasswordRecoveryEmailUseCase,
    SendPublicDataAccessAlertEmailUseCase,
  ],
})
export class NotificationModule {}
