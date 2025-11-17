import { Injectable, Inject } from '@nestjs/common';
import { ClientUser } from 'src/domain/entities/client-user.entity';
import { IClientUserRepository } from 'src/domain/repositories/i-client-user.repository';
import type { IDatabaseGateway } from '../contracts/i-database-service.gateway';
import type { IClientUserMapper } from 'src/application/mapping/i-client-user.mapper';

@Injectable()
export class ClientUserRepository implements IClientUserRepository {
  constructor(
    @Inject('IDatabaseGateway')
    private readonly databaseGateway: IDatabaseGateway,
    @Inject('IClientUserMapper')
    private readonly clientUserMapper: IClientUserMapper,
  ) {}

  public async save(entity: ClientUser): Promise<ClientUser> {
    const dto = this.clientUserMapper.toDbRequestDto(entity);
    const response = await this.databaseGateway.saveClientUser(dto);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async create(entity: ClientUser): Promise<ClientUser> {
    const dto = this.clientUserMapper.toDbRequestDto(entity);
    const response = await this.databaseGateway.createClientUser(dto);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async getByEmail(email: string): Promise<ClientUser> {
    const response = await this.databaseGateway.getClientUserByEmail(email);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async getById(id: string): Promise<ClientUser> {
    const response = await this.databaseGateway.getClientUserById(id);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async findEmail(email: string): Promise<boolean> {
    return this.databaseGateway.findEmail(email);
  }
}
