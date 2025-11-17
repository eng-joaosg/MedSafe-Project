import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CommonLogger } from 'src/common/logger/common.logger';
import { ConfigurationException } from 'src/common/exceptions/app.exception';
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
    CommonLogger.info('NotificationGateway', 'INIT', 'SQSClient inicializado com sucesso');
  }

  async publish(message: Record<string, any>): Promise<void> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      });

      await this.sqsClient.send(command);

      CommonLogger.info('NotificationGateway', 'PUBLISH', `Mensagem publicada no SQS: ${JSON.stringify(message)}`);
    } catch (error: any) {
      CommonLogger.error('NotificationGateway', 'PUBLISH_FAIL', `Erro ao publicar mensagem no SQS: ${error.message}`);
      throw error;
    }
  }
}
