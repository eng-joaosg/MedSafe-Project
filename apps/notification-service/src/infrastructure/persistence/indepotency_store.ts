import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { CommonLogger } from '../../common/logger/common.logger';
import { IIdempotencyStore } from '../../domain/contracts/i-indepodency-store';
import { ConfigurationException } from '../../common/exceptions/app.exception';

export class IdempotencyStore implements IIdempotencyStore {
  private readonly tableName: string;
  private readonly isDev: boolean;

  constructor(
    tableName: string,
    private readonly configService: ConfigService,
    private readonly clientOverride?: DynamoDBClient,
  ) {
    this.isDev = this.configService.get<string>('NODE_ENV') === 'DEV';
    this.tableName = tableName?.trim() || '';

    if (!this.tableName) {
      throw new ConfigurationException('Table name must be defined by calling module (DYNAMO_TABLE_NAME is missing)');
    }
  }

  private get client(): DynamoDBClient | null {
    if (this.clientOverride) return this.clientOverride;

    if (this.isDev) return null;
    return new DynamoDBClient({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async check(id: string): Promise<boolean> {
    try {
      if (this.isDev) return false;

      const result = await this.client!.send(
        new GetItemCommand({
          TableName: this.tableName,
          Key: { id: { S: id } },
        }),
      );
      const exists = !!result.Item;
      CommonLogger.info('IdempotencyStore', 'check', `ID ${id} exists: ${exists}`, id);
      return exists;
    } catch (err) {
      CommonLogger.error('IdempotencyStore', 'check', `Erro ao verificar id ${id}`, err, id);
      throw err;
    }
  }

  async markProcessed(id: string, type: string, version: number, payload: any): Promise<void> {
    try {
      if (this.isDev) return;

      await this.client!.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: {
            id: { S: id },
            type: { S: type },
            version: { N: version.toString() },
            payload: { S: JSON.stringify(payload) },
            processedAt: { S: new Date().toISOString() },
          },
          ConditionExpression: 'attribute_not_exists(id)',
        }),
      );
      CommonLogger.info('IdempotencyStore', 'markProcessed', `ID ${id} marcado como processado`, id);
    } catch (err) {
      CommonLogger.error('IdempotencyStore', 'markProcessed', `Erro ao marcar id ${id} como processado`, err, id);
      throw err;
    }
  }
}
