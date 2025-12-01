import { Inject } from '@nestjs/common';
import type { IAssociateClinicalInfoUsecase } from '../../../application/contracts/i-associate-clinical-info.usecase';
import { ASSOCIATE_CLINICAL_INFO_USECASE } from '../../../common/utils/tokens.contants';
import { SessionDto } from '../../../application/dtos/client-user/session.dto';

export class AssociateClinicalInfoHandler {
  constructor(
    @Inject(ASSOCIATE_CLINICAL_INFO_USECASE)
    private readonly usecase: IAssociateClinicalInfoUsecase,
  ) {}

  async execute(clientUserId: string, clinicalInfoId: string): Promise<SessionDto> {
    const sessionUser = await this.usecase.execute(clientUserId, clinicalInfoId);
    return sessionUser;
  }
}
