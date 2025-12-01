import { SessionDto } from '../dtos/client-user/session.dto';

export interface IChangeNameClientUserUseCase {
  execute(id: string, newFirstName: string, newLastName: string): Promise<SessionDto>;
}
