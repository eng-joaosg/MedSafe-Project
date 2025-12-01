import { LoginClientUserDto } from '../dtos/client-user/login-client-user.dto';
import { SessionDto } from '../dtos/client-user/session.dto';

export interface ILoginClientUserUseCase {
  execute(dto: LoginClientUserDto): Promise<SessionDto>;
}
