import { SessionClientUserDto } from '../dtos/client-user/session-client-user.dto';

export interface IChangeNameClientUserUseCase {
  execute(id: string, newFirstName: string, newLastName: string): Promise<SessionClientUserDto>;
}
