import { ClientUser } from '../entities/client-user.entity';

export interface INotificationService {
  sendVerification(user: ClientUser, code: string): Promise<void>;
  sendPasswordRecovery(user: ClientUser, code: string): Promise<void>;
  sendAccountCreated(user: ClientUser): Promise<void>;
  sendPublicDataAccess(user: ClientUser, accessedAt: Date): Promise<void>;
}
