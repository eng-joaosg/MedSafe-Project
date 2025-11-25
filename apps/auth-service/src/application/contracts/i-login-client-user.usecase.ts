import { LoginClientUserDto } from '../dtos/client-user/login-client-user.dto';
import { SessionClientUserDto } from '../dtos/client-user/session-client-user.dto';

export interface ILoginClientUserUseCase {
  execute(dto: LoginClientUserDto): Promise<SessionClientUserDto>;
}
