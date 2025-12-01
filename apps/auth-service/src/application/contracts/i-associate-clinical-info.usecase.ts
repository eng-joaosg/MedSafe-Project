import { SessionDto } from '../dtos/client-user/session.dto';

export interface IAssociateClinicalInfoUsecase {
  execute(clientUserId: string, clinicalInfoId: string): Promise<SessionDto>;
}
