import { ClienteUser } from '../entities/client-user.entity';

export interface IClientUserRepository {
  save(clientUser: ClienteUser): Promise<ClienteUser>;
  create(clientUser: ClienteUser): Promise<ClienteUser>;
  getByEmail(email: string): Promise<ClienteUser>;
  getById(id: string | number): Promise<ClienteUser>;
  findEmail(email: string): Promise<boolean>;
}
