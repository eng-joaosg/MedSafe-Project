import { ClientUserDbtDto } from '../../application/dtos/client-user/client-user-db.dto';

export interface IDatabaseGateway {
  // ---------- CLIENT USER ----------
  saveClientUser(id: string, dto: ClientUserDbtDto): Promise<ClientUserDbtDto>;
  createClientUser(id: string, dto: ClientUserDbtDto): Promise<ClientUserDbtDto>;
  getClientUserByEmail(email: string): Promise<ClientUserDbtDto>;
  getClientUserById(id: string): Promise<ClientUserDbtDto>;
  getClientUserByClinicalInfoId(id: string): Promise<ClientUserDbtDto>;
  findEmail(email: string): Promise<boolean>;
  deleteClientUser(id: string): Promise<void>;

  // ---------- CLINICAL INFO RECORD ----------
  findPublicPasswordById<T>(recordId: string): Promise<T>;
}
