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
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'CREATE', 'Erro ao criar ClientUser', err);
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async activate(id: string): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestPartialDto({ is_active: true, verification_code: null, code_expires_at: null });
      const response = await this.gateway.saveClientUser(id, dto);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'ACTIVATE', `Erro ao ativar usuário: ${id}`, err);
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
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'CHANGE_PASSWORD', `Erro ao alterar senha: ${id}`, err);
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
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'CHANGE_NAME', `Erro ao alterar nome: ${id}`, err);
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
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'GET_BY_EMAIL', `Erro ao buscar ClientUser por email: ${email}`, err);
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
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'GET_BY_ID', `Erro ao buscar ClientUser por id: ${id}`, err);
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async getByClinicalInfoId(id: string): Promise<ClientUser> {
    try {
      const response = await this.gateway.getClientUserById(id);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'GET_BY_ID', `Erro ao buscar ClientUser por ClinicalIndoId: ${id}`, err);
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.gateway.getClientUserById(id);
    } catch (err: any) {
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'DELETE_CLIENT_USER', `Erro ao deletar ClientUser com id: ${id}`, err);
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async findEmail(email: string): Promise<boolean> {
    try {
      return await this.gateway.findEmail(email);
    } catch (err: any) {
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'FIND_EMAIL', `Erro ao verificar email: ${email}`, err);
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
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error(
          'DatabaseService',
          'ASSOCIATE_CLINICAL_INFO',
          `Erro ao associar ClinicalInfo ao ClientUser: ${clientUserId}`,
          err,
        );
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async newVerificationCode(clientUserId: string, code: string, expireAt: Date): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestPartialDto({
        verification_code: code,
        code_expires_at: expireAt,
      });

      const response = await this.gateway.saveClientUser(clientUserId, dto);

      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'NEW_VERIFICATION_CODE', `Erro ao gerar novo código para ClientUser: ${clientUserId}`, err);
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async resetePassword(clientUserId: string, newPasswordHash: string): Promise<ClientUser> {
    try {
      const dto = this.mapper.toDbRequestPartialDto({
        password_hash: newPasswordHash,
        verification_code: null,
        code_expires_at: null,
      });

      const response = await this.gateway.saveClientUser(clientUserId, dto);

      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        CommonLogger.error('DatabaseService', 'NEW_VERIFICATION_CODE', `Erro ao gerar novo código para ClientUser: ${clientUserId}`, err);
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }
}
