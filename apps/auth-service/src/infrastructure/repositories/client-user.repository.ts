import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { IClientUserRepository } from '../../domain/repositories/i-client-user.repository';
import type { IDatabaseGateway } from '../contracts/i-database-service.gateway';
import type { IClientUserMapper } from '../../application/mapping/i-client-user.mapper';
import { ExternalServiceException } from '../../common/exceptions/app.exception';
import { CommonLogger } from '../../common/logger/common.logger';
import { CLIENT_USER_MAPPER, DATABASE_GATEWAY } from '../../common/utils/tokens.contants';

@Injectable()
export class ClientUserRepository implements IClientUserRepository {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly gateway: IDatabaseGateway,
    @Inject(CLIENT_USER_MAPPER)
    private readonly mapper: IClientUserMapper,
  ) {}

  public async create(entity: ClientUser): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestDto(entity);
      const response = await this.gateway.createClientUser(entity.getId().toString(), dto);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'CREATE', 'Erro ao criar ClientUser', err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async activate(id: string): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestPartialDto({ is_active: true });
      const response = await this.gateway.saveClientUser(id, dto);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'ACTIVATE', `Erro ao ativar usuário: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async changePassword(id: string, newPasswordHash: string): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestPartialDto({ password_hash: newPasswordHash });
      const response = await this.gateway.saveClientUser(id, dto);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'CHANGE_PASSWORD', `Erro ao alterar senha: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async changeName(id: string, firstName: string, lastName: string): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestPartialDto({ first_name: firstName, last_name: lastName });
      const response = await this.gateway.saveClientUser(id, dto);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'CHANGE_NAME', `Erro ao alterar nome: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async getByEmail(email: string): Promise<ClientUser> {
    try {
      const response = await this.gateway.getClientUserByEmail(email);
      return this.mapper.dbResponseToEntity(response);
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
      const response = await this.gateway.getClientUserById(id);
      return this.mapper.dbResponseToEntity(response);
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
      return await this.gateway.findEmail(email);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'FIND_EMAIL', `Erro ao verificar email: ${email}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }
  public async associateClinicalInfo(clientUserId: string, clinicalInfoId: string): Promise<ClientUser> {
    try {
      const payload = this.mapper.toDbRequestPartialDto({ clinical_info_id: clinicalInfoId });
      const response = await this.gateway.saveClientUser(clientUserId, payload);

      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'ASSOCIATE_CLINICAL_INFO', `Erro ao associar ClinicalInfo ao ClientUser: ${clientUserId}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }
}
