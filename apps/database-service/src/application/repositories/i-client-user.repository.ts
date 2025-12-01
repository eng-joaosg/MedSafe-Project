import { ClientUserModel } from '../models/client-user.model';

export interface IClientUserRepository {
  save(model: ClientUserModel, id: string): Promise<ClientUserModel | null>;
  getById(id: string): Promise<ClientUserModel | null>;
  getByEmail(email: string): Promise<ClientUserModel | null>;
  deleteById(id: string): Promise<void>;
  getByClinicalInfoId(clinicalInfoId: string): Promise<ClientUserModel | null>;
}
