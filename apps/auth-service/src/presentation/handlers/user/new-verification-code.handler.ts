import { NEW_VERIFICATION_CODE_USECASE } from '../../../common/utils/tokens.contants';
import { CommonLogger } from '../../../common/logger/common.logger';
import type { INewVerificationCodeUsecase } from '../../../application/contracts/i-new-verification-code.usecase';
import { Inject } from '@nestjs/common';

export class NewVerificationCodeHandler {
  constructor(
    @Inject(NEW_VERIFICATION_CODE_USECASE)
    private readonly usecase: INewVerificationCodeUsecase,
  ) {}

  async execute(email: string, type: string): Promise<void> {
    CommonLogger.info('Auth', 'FIND_EMAIL_START', email);
    if (!email || !email.includes('@')) {
      return;
    }
    await this.usecase.execute(email, type);
  }
}
