import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KinghostMailerService } from '../mail-service/kinghost-mailer.service';
import { KinghostApiMailerService } from '../mail-service/kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from '../mail-service/kinghost-smtp-mailer.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    KinghostApiMailerService,
    KinghostSmtpMailerService,
    {
      provide: 'IMailerService',
      useFactory: (apiMailer: KinghostApiMailerService, smtpMailer: KinghostSmtpMailerService) =>
        new KinghostMailerService(apiMailer, smtpMailer),
      inject: [KinghostApiMailerService, KinghostSmtpMailerService],
    },
  ],
  exports: ['IMailerService'],
})
export class MailerModule {}
