import { ClientUser } from '../entities/client-user.entity';

export interface IClientUserRepository {
  create(clientUser: ClientUser): Promise<ClientUser>;
  getByEmail(email: string): Promise<ClientUser>;
  getById(id: string): Promise<ClientUser>;
  findEmail(email: string): Promise<boolean>;
  activate(id: string): Promise<ClientUser>;
  changePassword(id: string, passwordHash: string): Promise<ClientUser>;
  changeName(id: string, firstName: string, lastName: string): Promise<ClientUser>;
  associateClinicalInfo(clientUserid: string, clinicalInfoId: string): Promise<ClientUser>;
  delete(id: string): Promise<void>;
  newVerificationCode(id: string, verificationCode: string, codeExpiresAt: Date): Promise<ClientUser>;
  resetePassword(id: string, newPasswordHash: string): Promise<ClientUser>;
  getByClinicalInfoId(id: string): Promise<ClientUser>;
}
