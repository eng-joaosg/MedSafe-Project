import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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
    this.isDev = this.configService.get<string>('NODE_ENV') === 'development';
    this.tableName = tableName?.trim() || '';

    if (!this.tableName) {
      throw new ConfigurationException('Table name must be defined (DYNAMO_TABLE_NAME missing)');
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
    if (this.isDev) return false;

    const result = await this.client!.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
      }),
    );

    if (!result.Item) return false;

    const status = result.Item.status?.S;
    const exists = status === 'processing' || status === 'processed';
    CommonLogger.info('IdempotencyStore', 'check', `ID ${id} status=${status}`, id);
    return exists;
  }

  async markProcessing(id: string, type: string, version: number, payload: any): Promise<void> {
    if (this.isDev) return;

    await this.client!.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: {
          id: { S: id },
          type: { S: type },
          version: { N: version.toString() },
          payload: { S: JSON.stringify(payload) },
          status: { S: 'processing' },
          updatedAt: { S: new Date().toISOString() },
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    );
    CommonLogger.info('IdempotencyStore', 'markProcessing', `ID ${id} marcado como processing`, id);
  }

  async markProcessed(id: string): Promise<void> {
    if (this.isDev) return;

    await this.client!.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
        UpdateExpression: 'SET #s = :s, processedAt = :t',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':s': { S: 'processed' },
          ':t': { S: new Date().toISOString() },
        },
      }),
    );
    CommonLogger.info('IdempotencyStore', 'markProcessed', `ID ${id} marcado como processed`, id);
  }

  async markFailed(id: string): Promise<void> {
    if (this.isDev) return;

    await this.client!.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
        UpdateExpression: 'SET #s = :s, failedAt = :t',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':s': { S: 'failed' },
          ':t': { S: new Date().toISOString() },
        },
      }),
    );
    CommonLogger.info('IdempotencyStore', 'markFailed', `ID ${id} marcado como failed`, id);
  }
}
