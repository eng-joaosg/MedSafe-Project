import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './infrastructure/modules/mailer.module';
import { NotificationHandlerModule } from './interfaces/notification-handler.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }), MailerModule, NotificationHandlerModule],
})
export class AppModule {}
