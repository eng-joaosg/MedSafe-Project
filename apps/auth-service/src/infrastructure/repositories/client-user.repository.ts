import { Injectable } from '@nestjs/common';
import { ClienteUser } from 'src/domain/entities/client-user.entity';
import { IClientUserRepository } from 'src/domain/repositories/i-client-user.repository';
import { DatabaseGateway } from '../gateways/database-service.gateway';
import { ClientUserMapper } from 'src/application/mapping/client-user.mapper';

@Injectable()
export class ClientUserRepository implements IClientUserRepository {
  constructor(
    private readonly databaseGateway: DatabaseGateway,
    private readonly clientUserMapper: ClientUserMapper,
  ) {}

  public async save(entity: ClienteUser): Promise<ClienteUser> {
    const dto = this.clientUserMapper.toDbRequestDto(entity);
    const response = await this.databaseGateway.saveClientUser(dto);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async create(entity: ClienteUser): Promise<ClienteUser> {
    const dto = this.clientUserMapper.toDbRequestDto(entity);
    const response = await this.databaseGateway.createClientUser(dto);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async getByEmail(email: string): Promise<ClienteUser> {
    const response = await this.databaseGateway.getClientUserByEmail(email);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async getById(id: string): Promise<ClienteUser> {
    const response = await this.databaseGateway.getClientUserById(id);
    return this.clientUserMapper.dbResponseToEntity(response);
  }

  public async findEmail(email: string): Promise<boolean> {
    return await this.databaseGateway.findEmail(email);
  }
}
