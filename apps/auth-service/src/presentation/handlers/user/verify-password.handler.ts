import { Inject } from '@nestjs/common';
import { VERIFY_PASSWORD_USECASE } from '../../../common/utils/tokens.contants';
import type { IVerifyPasswordUseCase } from '../../../application/contracts/i-verify-password.usecase';

export class VerifyPasswordHandler {
  constructor(
    @Inject(VERIFY_PASSWORD_USECASE)
    private readonly usecase: IVerifyPasswordUseCase,
  ) {}

  async execute(id: string, password: string): Promise<boolean> {
    return await this.usecase.execute(id, password);
  }
}
