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
    CommonLogger.info('DatabaseService', 'CREATE', `Chamando database-service para criar ClientUser: ${entity.getId()}`);
    try {
      const dto = this.mapper.toDbRequestDto(entity);
      const response = await this.gateway.createClientUser(entity.getId().toString(), dto);
      CommonLogger.info('DatabaseService', 'CREATE', `Finalizada a chamada para criar ClientUser: ${entity.getId()}`);
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
    CommonLogger.info('DatabaseService', 'ACTIVATE', `Chamando database-service para ativar ClientUser: ${id}`);
    try {
      const dto = this.mapper.toDbRequestPartialDto({ is_active: true, verification_code: null, code_expires_at: null });
      const response = await this.gateway.saveClientUser(id, dto);
      CommonLogger.info('DatabaseService', 'ACTIVATE', `Finalizada a chamada para ativar ClientUser: ${id}`);
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
    CommonLogger.info('DatabaseService', 'CHANGE_PASSWORD', `Chamando database-service para alterar senha de: ${id}`);
    try {
      const dto = this.mapper.toDbRequestPartialDto({ password_hash: newPasswordHash });
      const response = await this.gateway.saveClientUser(id, dto);
      CommonLogger.info('DatabaseService', 'CHANGE_PASSWORD', `Finalizada a chamada para alterar senha de: ${id}`);
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
    CommonLogger.info('DatabaseService', 'CHANGE_NAME', `Chamando database-service para alterar nome de: ${id}`);
    try {
      const dto = this.mapper.toDbRequestPartialDto({ first_name: firstName, last_name: lastName });
      const response = await this.gateway.saveClientUser(id, dto);
      CommonLogger.info('DatabaseService', 'CHANGE_NAME', `Finalizada a chamada para alterar nome de: ${id}`);
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
    CommonLogger.info('DatabaseService', 'GET_BY_EMAIL', `Chamando database-service para buscar ClientUser por email: ${email}`);
    try {
      const response = await this.gateway.getClientUserByEmail(email);
      CommonLogger.info('DatabaseService', 'GET_BY_EMAIL', `Finalizada a chamada para buscar ClientUser por email: ${email}`);
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
    CommonLogger.info('DatabaseService', 'GET_BY_ID', `Chamando database-service para buscar ClientUser por id: ${id}`);
    try {
      const response = await this.gateway.getClientUserById(id);
      CommonLogger.info('DatabaseService', 'GET_BY_ID', `Finalizada a chamada para buscar ClientUser por id: ${id}`);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'GET_BY_ID', `Erro ao buscar ClientUser por id: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async getByClinicalInfoId(id: string): Promise<ClientUser> {
    CommonLogger.info(
      'DatabaseService',
      'GET_BY_CLINICAL_INFO_ID',
      `Chamando database-service para buscar ClientUser por ClinicalInfoId: ${id}`,
    );
    try {
      const response = await this.gateway.getClientUserByClinicalInfoId(id);
      CommonLogger.info(
        'DatabaseService',
        'GET_BY_CLINICAL_INFO_ID',
        `Finalizada a chamada para buscar ClientUser por ClinicalInfoId: ${id}`,
      );
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'GET_BY_CLINICAL_INFO_ID', `Erro ao buscar ClientUser por ClinicalInfoId: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async delete(id: string): Promise<void> {
    CommonLogger.info('DatabaseService', 'DELETE_CLIENT_USER', `Chamando database-service para deletar ClientUser: ${id}`);
    try {
      await this.gateway.deleteClientUser(id);
      CommonLogger.info('DatabaseService', 'DELETE_CLIENT_USER', `Finalizada a chamada para deletar ClientUser: ${id}`);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'DELETE_CLIENT_USER', `Erro ao deletar ClientUser com id: ${id}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async findEmail(email: string): Promise<boolean> {
    CommonLogger.info('DatabaseService', 'FIND_EMAIL', `Chamando database-service para verificar email: ${email}`);
    try {
      const result = await this.gateway.findEmail(email);
      CommonLogger.info('DatabaseService', 'FIND_EMAIL', `Finalizada a chamada para verificar email: ${email}`);
      return result;
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'FIND_EMAIL', `Erro ao verificar email: ${email}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async associateClinicalInfo(clientUserId: string, clinicalInfoId: string): Promise<ClientUser> {
    CommonLogger.info(
      'DatabaseService',
      'ASSOCIATE_CLINICAL_INFO',
      `Chamando database-service para associar ClinicalInfo ao ClientUser: ${clientUserId}`,
    );
    try {
      const payload = this.mapper.toDbRequestPartialDto({ clinical_info_id: clinicalInfoId });
      const response = await this.gateway.saveClientUser(clientUserId, payload);
      CommonLogger.info(
        'DatabaseService',
        'ASSOCIATE_CLINICAL_INFO',
        `Finalizada a chamada para associar ClinicalInfo ao ClientUser: ${clientUserId}`,
      );
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'ASSOCIATE_CLINICAL_INFO', `Erro ao associar ClinicalInfo ao ClientUser: ${clientUserId}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async newVerificationCode(clientUserId: string, code: string, expireAt: Date): Promise<ClientUser> {
    CommonLogger.info(
      'DatabaseService',
      'NEW_VERIFICATION_CODE',
      `Chamando database-service para gerar novo código para ClientUser: ${clientUserId}`,
    );
    try {
      const dto = this.mapper.toDbRequestPartialDto({
        verification_code: code,
        code_expires_at: expireAt,
      });

      const response = await this.gateway.saveClientUser(clientUserId, dto);
      CommonLogger.info(
        'DatabaseService',
        'NEW_VERIFICATION_CODE',
        `Finalizada a chamada para gerar novo código para ClientUser: ${clientUserId}`,
      );
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'NEW_VERIFICATION_CODE', `Erro ao gerar novo código para ClientUser: ${clientUserId}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }

  public async resetePassword(clientUserId: string, newPasswordHash: string): Promise<ClientUser> {
    CommonLogger.info('DatabaseService', 'RESET_PASSWORD', `Chamando database-service para resetar senha de ClientUser: ${clientUserId}`);
    try {
      const dto = this.mapper.toDbRequestPartialDto({
        password_hash: newPasswordHash,
        verification_code: null,
        code_expires_at: null,
      });

      const response = await this.gateway.saveClientUser(clientUserId, dto);
      CommonLogger.info('DatabaseService', 'RESET_PASSWORD', `Finalizada a chamada para resetar senha de ClientUser: ${clientUserId}`);
      return this.mapper.dbResponseToEntity(response);
    } catch (err: any) {
      CommonLogger.error('DatabaseService', 'RESET_PASSWORD', `Erro ao resetar senha de ClientUser: ${clientUserId}`, err);
      if (err?.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ExternalServiceException('DatabaseService', err);
      }
      throw err;
    }
  }
}
