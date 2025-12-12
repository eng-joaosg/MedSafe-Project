import { Test, TestingModule } from '@nestjs/testing';
import { ClientUserRepository } from './client-user.repository';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { ExternalServiceException } from '../../common/exceptions/app.exception';
import { DATABASE_GATEWAY, CLIENT_USER_MAPPER } from '../../common/utils/tokens.contants';

describe('ClientUserRepository', () => {
  let repository: ClientUserRepository;
  let gatewayMock: any;
  let mapperMock: any;

  beforeEach(async () => {
    gatewayMock = {
      createClientUser: jest.fn(),
      saveClientUser: jest.fn(),
      getClientUserByEmail: jest.fn(),
      getClientUserById: jest.fn(),
      getClientUserByClinicalInfoId: jest.fn(),
      deleteClientUser: jest.fn(),
      findEmail: jest.fn(),
    };

    mapperMock = {
      toDbRequestDto: jest.fn(),
      toDbRequestPartialDto: jest.fn(),
      dbResponseToEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientUserRepository,
        { provide: DATABASE_GATEWAY, useValue: gatewayMock },
        { provide: CLIENT_USER_MAPPER, useValue: mapperMock },
      ],
    }).compile();

    repository = module.get<ClientUserRepository>(ClientUserRepository);
  });

  const mockEntity = new ClientUser('123', 'john@example.com', 'password', '456', 'John', 'Doe', true, null, null, new Date(), new Date());

  describe('create', () => {
    it('should create a ClientUser successfully', async () => {
      const dto = {};
      const dbResponse = { id: '123' };
      mapperMock.toDbRequestDto.mockReturnValue(dto);
      gatewayMock.createClientUser.mockResolvedValue(dbResponse);
      mapperMock.dbResponseToEntity.mockReturnValue(mockEntity);

      const result = await repository.create(mockEntity);

      expect(mapperMock.toDbRequestDto).toHaveBeenCalledWith(mockEntity);
      expect(gatewayMock.createClientUser).toHaveBeenCalledWith('123', dto);
      expect(mapperMock.dbResponseToEntity).toHaveBeenCalledWith(dbResponse);
      expect(result).toBe(mockEntity);
    });

    it('should throw ExternalServiceException for server errors', async () => {
      const err = { statusCode: 500 };
      mapperMock.toDbRequestDto.mockReturnValue({});
      gatewayMock.createClientUser.mockRejectedValue(err);

      await expect(repository.create(mockEntity)).rejects.toThrow(ExternalServiceException);
    });

    it('should throw original error for client errors', async () => {
      const err = { statusCode: 400 };
      mapperMock.toDbRequestDto.mockReturnValue({});
      gatewayMock.createClientUser.mockRejectedValue(err);

      await expect(repository.create(mockEntity)).rejects.toEqual(err);
    });
  });

  describe('activate', () => {
    it('should activate a user successfully', async () => {
      const dto = {};
      const dbResponse = { id: '123' };
      mapperMock.toDbRequestPartialDto.mockReturnValue(dto);
      gatewayMock.saveClientUser.mockResolvedValue(dbResponse);
      mapperMock.dbResponseToEntity.mockReturnValue(mockEntity);

      const result = await repository.activate('123');

      expect(result).toBe(mockEntity);
      expect(gatewayMock.saveClientUser).toHaveBeenCalledWith('123', dto);
    });
  });

  describe('getByEmail', () => {
    it('should get a user by email successfully', async () => {
      const dbResponse = { id: '123' };
      gatewayMock.getClientUserByEmail.mockResolvedValue(dbResponse);
      mapperMock.dbResponseToEntity.mockReturnValue(mockEntity);

      const result = await repository.getByEmail('john@example.com');

      expect(result).toBe(mockEntity);
      expect(gatewayMock.getClientUserByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      gatewayMock.deleteClientUser.mockResolvedValue(undefined);

      await expect(repository.delete('123')).resolves.toBeUndefined();
      expect(gatewayMock.deleteClientUser).toHaveBeenCalledWith('123');
    });
  });

  describe('findEmail', () => {
    it('should return true if email exists', async () => {
      gatewayMock.findEmail.mockResolvedValue(true);

      const result = await repository.findEmail('john@example.com');
      expect(result).toBe(true);
    });

    it('should throw ExternalServiceException for server errors', async () => {
      const err = { statusCode: 500 };
      gatewayMock.findEmail.mockRejectedValue(err);

      await expect(repository.findEmail('john@example.com')).rejects.toThrow(ExternalServiceException);
    });
  });

  // Você pode replicar o mesmo padrão para os outros métodos:
  // changePassword, changeName, associateClinicalInfo, newVerificationCode, resetePassword, getById, getByClinicalInfoId
});
