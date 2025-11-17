import { ReceiveMessageCommand, SQSClient, Message } from '@aws-sdk/client-sqs';
import { handler } from './lambda';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommonLogger } from './common/logger/common.logger';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);

  const SQS_QUEUE_URL = config.get<string>('SQS_QUEUE_URL');
  const AWS_REGION = config.get<string>('AWS_REGION');
  if (!SQS_QUEUE_URL || !AWS_REGION) {
    CommonLogger.error('SQSBootstrap', 'Init', 'Erro de configuração de ambiente.');
    throw new Error('Erro de configuração de ambiente.');
  }

  const sqs = new SQSClient({ region: AWS_REGION });

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      const response = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 5,
          MessageAttributeNames: ['All'],
          AttributeNames: ['All'],
        }),
      );

      const Messages = response.Messages;

      if (!Messages || Messages.length === 0) {
        CommonLogger.info('SQSBootstrap', 'Poll', 'Nenhuma mensagem na fila');
        continue;
      }

      const lambdaEvent: SQSEvent = {
        Records: Messages.map((msg: Message) => {
          const record: SQSRecord = {
            messageId: msg.MessageId!,
            receiptHandle: msg.ReceiptHandle!,
            body: msg.Body!,
            attributes: {
              ApproximateReceiveCount: msg.Attributes?.ApproximateReceiveCount || '1',
              SentTimestamp: msg.Attributes?.SentTimestamp || Date.now().toString(),
              SenderId: msg.Attributes?.SenderId || 'UNKNOWN',
              ApproximateFirstReceiveTimestamp: msg.Attributes?.ApproximateFirstReceiveTimestamp || Date.now().toString(),
            },
            messageAttributes: Object.fromEntries(
              Object.entries(msg.MessageAttributes || {}).map(([key, val]) => [
                key,
                {
                  dataType: val.DataType!,
                  stringValue: val.StringValue,
                  binaryValue: val.BinaryValue ? Buffer.from(val.BinaryValue).toString('base64') : undefined,
                },
              ]),
            ),
            md5OfBody: msg.MD5OfBody!,
            eventSource: 'aws:sqs',
            eventSourceARN: SQS_QUEUE_URL,
            awsRegion: AWS_REGION,
          };
          return record;
        }),
      };

      const result = await handler(lambdaEvent);
      CommonLogger.info('SQSBootstrap', 'HandlerResult', result);
    } catch (err) {
      CommonLogger.error('SQSBootstrap', 'Poll', 'Erro ao processar mensagens da fila', err);
    }
  }
}

bootstrap().catch((err) => {
  CommonLogger.error('SQSBootstrap', 'Bootstrap', 'Erro ao iniciar processamento SQS', err);
});
