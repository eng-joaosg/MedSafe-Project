import { SessionClientUserDto } from '../dtos/client-user/session-client-user.dto';

export interface IChangePasswordClientUserUseCase {
  execute(id: string, password: string, newPassword: string): Promise<SessionClientUserDto>;
}
