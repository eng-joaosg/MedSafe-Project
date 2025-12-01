/* eslint-disable @typescript-eslint/unbound-method */
import { ClinicalInfoService } from './clinical-info.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { IClinicalInfoRepository } from '../repositories/i-clinical-info.repository';
import { ClinicalInfoDto } from '../dtos/clinical-info.dto';
import { ClinicalInfoNotFoundException } from '../../common/exceptions/app.exceptions';
import { UnauthorizedException } from '@nestjs/common';

describe('ClinicalInfoService', () => {
  let service: ClinicalInfoService;
  let repositoryMock: MockProxy<IClinicalInfoRepository>;

  beforeEach(() => {
    repositoryMock = mock<IClinicalInfoRepository>();
    service = new ClinicalInfoService(repositoryMock);
  });

  const sampleDto: ClinicalInfoDto = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    bloodType: 'A+',
    sex: 'M',
    dateOfBirth: new Date('1990-01-01'),
    otherInfo: 'Info extra',
    publicCode: 'ABC123',
    createdAt: new Date(),
    updatedAt: new Date(),
    allergies: [],
    diseases: [],
    medications: [],
    surgeries: [],
    contacts: [],
  };

  describe('create', () => {
    it('deve criar um novo ClinicalInfo', async () => {
      repositoryMock.save.mockResolvedValue(sampleDto);

      const result = await service.create({ firstName: 'John' });
      expect(result).toEqual(sampleDto);
      expect(repositoryMock.save).toHaveBeenCalledWith({ firstName: 'John' }, expect.any(String));
    });

    it('deve lançar exceção se save retornar null', async () => {
      repositoryMock.save.mockResolvedValue(null);
      await expect(service.create({ firstName: 'John' })).rejects.toThrow(ClinicalInfoNotFoundException);
    });
  });

  describe('save', () => {
    it('deve salvar ClinicalInfo existente', async () => {
      repositoryMock.save.mockResolvedValue(sampleDto);

      const result = await service.save({ firstName: 'John' }, '1');
      expect(result).toEqual(sampleDto);
      expect(repositoryMock.save).toHaveBeenCalledWith({ firstName: 'John' }, '1');
    });

    it('deve lançar exceção se save retornar null', async () => {
      repositoryMock.save.mockResolvedValue(null);
      await expect(service.save({ firstName: 'John' }, '1')).rejects.toThrow(ClinicalInfoNotFoundException);
    });
  });

  describe('getById', () => {
    it('deve retornar ClinicalInfo', async () => {
      repositoryMock.getById.mockResolvedValue(sampleDto);
      const result = await service.getById('1');
      expect(result).toEqual(sampleDto);
      expect(repositoryMock.getById).toHaveBeenCalledWith('1');
    });

    it('deve lançar exceção se não encontrado', async () => {
      repositoryMock.getById.mockResolvedValue(null);
      await expect(service.getById('1')).rejects.toThrow(ClinicalInfoNotFoundException);
    });
  });

  describe('getByPublicCode', () => {
    it('deve retornar ClinicalInfo se código correto', async () => {
      repositoryMock.getById.mockResolvedValue(sampleDto);
      const result = await service.getByPublicCode('1', 'ABC123');
      expect(result).toEqual(sampleDto);
    });

    it('deve lançar UnauthorizedException se código inválido', async () => {
      repositoryMock.getById.mockResolvedValue(sampleDto);
      await expect(service.getByPublicCode('1', 'WRONG')).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar ClinicalInfoNotFoundException se não encontrado', async () => {
      repositoryMock.getById.mockResolvedValue(null);
      await expect(service.getByPublicCode('1', 'ABC123')).rejects.toThrow(ClinicalInfoNotFoundException);
    });
  });

  describe('deleteById', () => {
    it('deve chamar deleteById do repositório', async () => {
      repositoryMock.deleteById.mockResolvedValue(undefined);
      await service.deleteById('1');
      expect(repositoryMock.deleteById).toHaveBeenCalledWith('1');
    });
  });

  describe('getAllClinicalInfo', () => {
    it('deve retornar todas as informações clínicas', async () => {
      const info = {
        surgeries: ['Cirurgia1'],
        diseases: ['Doença1'],
        medications: ['Med1'],
        allergies: ['Alergia1'],
      };
      repositoryMock.getAllClinicalInfo.mockResolvedValue(info);
      const result = await service.getAllClinicalInfo();
      expect(result).toEqual(info);
    });
  });

  describe('generatePublicQrPdf', () => {
    it('deve gerar um Buffer de PDF', async () => {
      const buffer = await service.generatePublicQrPdf('https://example.com', 'ABC123');
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
