import { SessionDto } from '../dtos/client-user/session.dto';

export interface IChangePasswordClientUserUseCase {
  execute(id: string, password: string, newPassword: string): Promise<SessionDto>;
}
