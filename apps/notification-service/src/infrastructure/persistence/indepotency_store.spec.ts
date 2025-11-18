import { GetItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { IdempotencyStore } from './indepotency_store';

// Define a interface para o Mock do Cliente, garantindo que 'send' seja um jest.Mock
interface MockDynamoDBClient extends DynamoDBClient {
  send: jest.Mock;
}

// Mock do cliente DynamoDB, agora tipado corretamente
const mockClient: MockDynamoDBClient = {
  send: jest.fn(),
} as unknown as MockDynamoDBClient; // Forçamos o tipo para incluir as funções mock do Jest

// Mock para CommonLogger, essencial para evitar erros de importação/runtime
jest.mock('../../common/logger/common.logger', () => ({
  CommonLogger: {
    info: jest.fn(),
  },
}));

describe('IdempotencyStore Check Logic', () => {
  let store: IdempotencyStore;
  let mockConfigService: ConfigService;
  const tableName = 'events';

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'PROD';
        if (key === 'AWS_REGION') return 'us-east-1';
        return null;
      }),
    } as any;

    // Instancia a loja, injetando o mockClient
    // Note que o construtor espera DynamoDBClient, mas o TypeScipt aceita o Mock
    store = new IdempotencyStore(tableName, mockConfigService, mockClient);
  });

  // --- CHECK ---
  describe('check', () => {
    const id = '123-id';

    it('should return true if status is "processing"', async () => {
      mockClient.send.mockResolvedValueOnce({
        Item: { id: { S: id }, status: { S: 'processing' } },
      });
      expect(await store.check(id)).toBe(true);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetItemCommand));
    });

    it('should return true if status is "processed"', async () => {
      mockClient.send.mockResolvedValueOnce({
        Item: { id: { S: id }, status: { S: 'processed' } },
      });
      expect(await store.check(id)).toBe(true);
    });

    it('should return false if status is "failed"', async () => {
      mockClient.send.mockResolvedValueOnce({
        Item: { id: { S: id }, status: { S: 'failed' } },
      });
      expect(await store.check(id)).toBe(false);
    });

    it('should return false if item does not exist', async () => {
      mockClient.send.mockResolvedValueOnce({ Item: undefined });
      expect(await store.check(id)).toBe(false);
    });

    it('should return false immediately in DEV environment', async () => {
      (mockConfigService.get as jest.Mock).mockReturnValue('DEV');
      store = new IdempotencyStore(tableName, mockConfigService, mockClient);

      expect(await store.check(id)).toBe(false);
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it('should throw an error if DynamoDB call fails', async () => {
      mockClient.send.mockRejectedValueOnce(new Error('DB connection error'));
      await expect(store.check(id)).rejects.toThrow('DB connection error');
    });
  });
});
