import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotificationHandler } from './interfaces/sqs-notification.handler';
import { SQSEvent, SQSBatchResponse } from 'aws-lambda';

let cachedHandler: NotificationHandler;

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  if (!cachedHandler) {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    cachedHandler = appContext.get(NotificationHandler);
  }
  return cachedHandler.handle(event);
}
