import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { IClientUserRepository } from '../../domain/repositories/i-client-user.repository';
import type { IDatabaseGateway } from '../contracts/i-database-service.gateway';
import type { IClientUserMapper } from '../../application/mapping/i-client-user.mapper';
import { ExternalServiceException } from '../../common/exceptions/app.exception';
import { CommonLogger } from '../../common/logger/common.logger';

@Injectable()
export class ClientUserRepository implements IClientUserRepository {
  constructor(
    @Inject('IDatabaseGateway')
    private readonly databaseGateway: IDatabaseGateway,
    @Inject('IClientUserMapper')
    private readonly clientUserMapper: IClientUserMapper,
  ) {}

  public async save(entity: ClientUser): Promise<ClientUser> {
    try {
      const dto = this.clientUserMapper.toDbRequestDto(entity);
      const response = await this.databaseGateway.saveClientUser(dto);
      return this.clientUserMapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'SAVE', 'Erro ao salvar ClientUser', err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async create(entity: ClientUser): Promise<ClientUser> {
    try {
      const dto = this.clientUserMapper.toDbRequestDto(entity);
      const response = await this.databaseGateway.createClientUser(dto);
      return this.clientUserMapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'CREATE', 'Erro ao criar ClientUser', err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async getByEmail(email: string): Promise<ClientUser> {
    try {
      const response = await this.databaseGateway.getClientUserByEmail(email);
      return this.clientUserMapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'GET_BY_EMAIL', `Erro ao buscar ClientUser por email: ${email}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async getById(id: string): Promise<ClientUser> {
    try {
      const response = await this.databaseGateway.getClientUserById(id);
      return this.clientUserMapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'GET_BY_ID', `Erro ao buscar ClientUser por id: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async findEmail(email: string): Promise<boolean> {
    try {
      return await this.databaseGateway.findEmail(email);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'FIND_EMAIL', `Erro ao verificar email: ${email}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }
}
