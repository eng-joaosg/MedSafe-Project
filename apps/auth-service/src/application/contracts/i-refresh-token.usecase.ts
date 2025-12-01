import { SessionDto } from '../dtos/client-user/session.dto';

export interface IRefreshTokenUseCase {
  execute(id: string | number, role: string): Promise<SessionDto>;
}
