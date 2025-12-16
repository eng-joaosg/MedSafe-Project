import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CommonLogger } from '../../common/logger/common.logger';
import { ConfigurationException, ExternalServiceException } from '../../common/exceptions/app.exception';
import { INotificationGateway } from '../contracts/i-notification-service.gateway';

@Injectable()
export class NotificationGateway implements OnModuleInit, INotificationGateway {
  private sqsClient: SQSClient | null = null;
  private queueUrl: string | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const env = this.config.get<string>('NODE_ENV');

    this.queueUrl = this.config.get<string>('SQS_QUEUE_URL')!;
    if (!this.queueUrl) {
      throw new ConfigurationException('Configuração inválida: SQS_QUEUE_URL não definido no ambiente.');
    }

    if (env === 'staging') {
      const region = this.config.get<string>('AWS_REGION');
      const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');

      if (!region || !accessKeyId || !secretAccessKey) {
        throw new ConfigurationException('Configuração inválida: verifique AWS_REGION, AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY no .env');
      }

      this.sqsClient = new SQSClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      CommonLogger.info('NotificationGateway', 'INICIALIZAÇÃO', 'Modo staging: SQS inicializado com variáveis de ambiente.');
    }

    if (env === 'production') {
      this.sqsClient = new SQSClient({});
      CommonLogger.info('NotificationGateway', 'INICIALIZAÇÃO', 'Modo produção: SQS inicializado com IAM role da Lambda ou instância.');
    }
  }

  async publish(message: Record<string, any>): Promise<void> {
    if (!this.sqsClient || !this.queueUrl) {
      throw new ConfigurationException('SQS Client ou Queue URL não inicializados.');
    }

    CommonLogger.info(
      'NotificationGateway',
      'PUBLICAÇÃO_INICIADA',
      `Preparando para enviar mensagem ao SQS: tipo=${message.type}, e-mail=${message.payload?.email || 'não informado'}`,
    );

    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      });

      await this.sqsClient.send(command);

      CommonLogger.info(
        'NotificationGateway',
        'PUBLICAÇÃO_CONCLUÍDA',
        `Mensagem publicada no SQS com sucesso: tipo=${message.type}, e-mail=${message.payload?.email || 'não informado'}`,
      );
    } catch (err: any) {
      CommonLogger.error('NotificationGateway', 'FALHA_PUBLICAÇÃO', `Erro ao publicar mensagem no SQS: ${err.message}`, err);
      throw new ExternalServiceException('AWS SQS', err);
    }
  }
}
