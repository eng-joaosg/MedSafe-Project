import { ClientUser } from '../entities/client-user.entity';

export interface IClientUserRepository {
  save(clientUser: ClientUser): Promise<ClientUser>;
  create(clientUser: ClientUser): Promise<ClientUser>;
  getByEmail(email: string): Promise<ClientUser>;
  getById(id: string | number): Promise<ClientUser>;
  findEmail(email: string): Promise<boolean>;
}
