import { SessionClientUserDto } from '../dtos/client-user/session-client-user.dto';

export interface IAssociateClinicalInfoUsecase {
  execute(clientUserId: string, clinicalInfoId: string): Promise<SessionClientUserDto>;
}
