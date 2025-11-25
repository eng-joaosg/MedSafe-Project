import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KinghostMailerService } from '../mail-service/kinghost-mailer.service';
import { KinghostApiMailerService } from '../mail-service/kinghost-api-mailer.service';
import { KinghostSmtpMailerService } from '../mail-service/kinghost-smtp-mailer.service';
import { APP_LINKS, EMAIL_TEMPLATES, MAILER_SERVICE } from '../../common/constants/token.constants';
import { AppLinks } from '../../application/utils/app-links';
import { EmailTemplates } from '../../application/utils/email.template';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [
    KinghostApiMailerService,
    KinghostSmtpMailerService,
    {
      provide: MAILER_SERVICE,
      useFactory: (apiMailer: KinghostApiMailerService, smtpMailer: KinghostSmtpMailerService, configService: ConfigService) =>
        new KinghostMailerService(apiMailer, smtpMailer, configService),
      inject: [KinghostApiMailerService, KinghostSmtpMailerService, ConfigService],
    },
    {
      provide: APP_LINKS,
      useFactory: (config: ConfigService) => new AppLinks(config),
      inject: [ConfigService],
    },
    {
      provide: EMAIL_TEMPLATES,
      useClass: EmailTemplates,
    },
  ],
  exports: [MAILER_SERVICE, APP_LINKS, EMAIL_TEMPLATES],
})
export class MailerModule {}
