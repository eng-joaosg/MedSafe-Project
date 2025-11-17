import { ClientUserModel } from '../models/client-user.model';

export interface IClientUserRepository {
  save(payload: ClientUserModel): Promise<ClientUserModel | null>;
  getById(id: string): Promise<ClientUserModel | null>;
  getByEmail(email: string): Promise<ClientUserModel | null>;
  deleteById(id: string): Promise<void>;
}
