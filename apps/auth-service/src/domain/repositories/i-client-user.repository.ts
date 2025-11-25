import { ClientUser } from '../entities/client-user.entity';

export interface IClientUserRepository {
  create(clientUser: ClientUser): Promise<ClientUser>;
  getByEmail(email: string): Promise<ClientUser>;
  getById(id: string): Promise<ClientUser>;
  findEmail(email: string): Promise<boolean>;
  activate(id: string): Promise<ClientUser>;
  changePassword(id: string, passwordHash: string): Promise<ClientUser>;
  changeName(id: string, firstName: string, lastName: string): Promise<ClientUser>;
}
