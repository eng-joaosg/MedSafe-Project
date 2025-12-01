import { ClientUserModel } from '../models/client-user.model';

export interface IClientUserService {
  save(id: string, model: Partial<ClientUserModel>): Promise<ClientUserModel>;
  getById(id: string): Promise<ClientUserModel>;
  getByClinicalInfoId(id: string): Promise<ClientUserModel>;
  getByEmail(email: string): Promise<ClientUserModel>;
  deleteById(id: string): Promise<void>;
  findEmail(email: string): Promise<boolean>;
}
