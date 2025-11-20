import { ClientUserDbtDto } from '../../application/dtos/client-user/client-user-db.dto';

export interface IDatabaseGateway {
  // ---------- CLIENT USER ----------
  saveClientUser(dto: ClientUserDbtDto): Promise<ClientUserDbtDto>;
  createClientUser(dto: ClientUserDbtDto): Promise<ClientUserDbtDto>;
  getClientUserByEmail(email: string): Promise<ClientUserDbtDto>;
  getClientUserById(id: string): Promise<ClientUserDbtDto>;
  findEmail(email: string): Promise<boolean>;

  // ---------- CLINICAL INFO RECORD ----------
  findPublicPasswordById<T>(recordId: string): Promise<T>;
}
