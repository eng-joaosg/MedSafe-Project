/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ClientUserService } from './client-user.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { IClientUserRepository } from '../repositories/i-client-user.repository';
import { ClientUserModel } from '../models/client-user.model';
import { UserNotFoundException } from '../../common/exceptions/app.exceptions';

describe('ClientUserService', () => {
  let service: ClientUserService;
  let repositoryMock: MockProxy<IClientUserRepository>;

  beforeEach(() => {
    repositoryMock = mock<IClientUserRepository>();
    service = new ClientUserService(repositoryMock);
  });

  const sampleUser: ClientUserModel = {
    id: '1',
    email: 'test@example.com',
    clinical_info_id: 'clinical1',
    first_name: 'John',
    last_name: 'Doe',
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe('save', () => {
    it('deve salvar um usuário existente', async () => {
      repositoryMock.save.mockResolvedValue(sampleUser);
      const result = await service.save('1', { first_name: 'John' });
      expect(result).toEqual(sampleUser);
      expect(repositoryMock.save).toHaveBeenCalledWith({ first_name: 'John' }, '1');
    });

    it('deve lançar exceção se save retornar null', async () => {
      repositoryMock.save.mockResolvedValue(null as any);
      await expect(service.save('1', { first_name: 'John' })).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('getById', () => {
    it('deve retornar usuário por ID', async () => {
      repositoryMock.getById.mockResolvedValue(sampleUser);
      const result = await service.getById('1');
      expect(result).toEqual(sampleUser);
    });

    it('deve lançar UserNotFoundException se não encontrado', async () => {
      repositoryMock.getById.mockResolvedValue(null);
      await expect(service.getById('1')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('getByClinicalInfoId', () => {
    it('deve retornar usuário por ClinicalInfoId', async () => {
      repositoryMock.getByClinicalInfoId.mockResolvedValue(sampleUser);
      const result = await service.getByClinicalInfoId('clinical1');
      expect(result).toEqual(sampleUser);
      expect(repositoryMock.getByClinicalInfoId).toHaveBeenCalledWith('clinical1');
    });

    it('deve lançar UserNotFoundException se não encontrado', async () => {
      repositoryMock.getByClinicalInfoId.mockResolvedValue(null);
      await expect(service.getByClinicalInfoId('clinical1')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('getByEmail', () => {
    it('deve retornar usuário por email', async () => {
      repositoryMock.getByEmail.mockResolvedValue(sampleUser);
      const result = await service.getByEmail('test@example.com');
      expect(result).toEqual(sampleUser);
    });

    it('deve lançar UserNotFoundException se email não encontrado', async () => {
      repositoryMock.getByEmail.mockResolvedValue(null);
      await expect(service.getByEmail('notfound@example.com')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('deleteById', () => {
    it('deve chamar deleteById do repositório', async () => {
      repositoryMock.deleteById.mockResolvedValue(undefined);
      await service.deleteById('1');
      expect(repositoryMock.deleteById).toHaveBeenCalledWith('1');
    });
  });

  describe('findEmail', () => {
    it('deve retornar true se email existir', async () => {
      repositoryMock.getByEmail.mockResolvedValue(sampleUser);
      const result = await service.findEmail('test@example.com');
      expect(result).toBe(true);
    });

    it('deve retornar false se email não existir', async () => {
      repositoryMock.getByEmail.mockResolvedValue(null);
      const result = await service.findEmail('notfound@example.com');
      expect(result).toBe(false);
    });
  });
});
