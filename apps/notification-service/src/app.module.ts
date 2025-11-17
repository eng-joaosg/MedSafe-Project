import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './infrastructure/modules/mailer.module';
import { NotificationModule } from './infrastructure/modules/notification.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }), MailerModule, NotificationModule],
})
export class AppModule {}
