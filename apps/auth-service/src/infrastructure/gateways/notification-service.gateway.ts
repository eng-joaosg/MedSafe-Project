import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CommonLogger } from '../../common/logger/common.logger';
import { ConfigurationException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { INotificationGateway } from '../contracts/i-notification-service.gateway';

@Injectable()
export class NotificationGateway implements OnModuleInit, INotificationGateway {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const region = this.config.get<string>('AWS_REGION');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    const queueUrl = this.config.get<string>('SQS_QUEUE_URL');

    if (!region || !accessKeyId || !secretAccessKey || !queueUrl) {
      throw new ConfigurationException(
        'Configuração inválida: verifique AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e SQS_QUEUE_URL no .env',
      );
    }

    this.sqsClient = new SQSClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.queueUrl = queueUrl;
  }

  async publish(message: Record<string, any>): Promise<void> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      });

      await this.sqsClient.send(command);

      CommonLogger.info(
        'NotificationGateway',
        'PUBLISH',
        `Mensagem publicada no SQS: tipo: ${message.type}, e-mail: ${message.payload.email}.`,
      );
    } catch (err: any) {
      CommonLogger.error('NotificationGateway', 'PUBLISH_FAIL', `Erro ao publicar mensagem no SQS: ${err.message}`, err);
      throw new ExternalServiceException('AWS SQS', err);
    }
  }
}
