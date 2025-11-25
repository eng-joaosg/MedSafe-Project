import { Inject } from '@nestjs/common';
import { VERIFY_ACCOUNT_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import { VerifyAccountClientUserDto } from '../../../application/dtos/client-user/verify-account-client-user.dto';
import type { IVerifyAccountClientUserUseCase } from '../../../application/contracts/i-verify-account-client-user.usecase';

export class VerifyAccountClientUserHandler {
  constructor(
    @Inject(VERIFY_ACCOUNT_CLIENT_USER_USECASE)
    private readonly usecase: IVerifyAccountClientUserUseCase,
  ) {}

  async execute(payload: VerifyAccountClientUserDto): Promise<{ success: boolean }> {
    await this.usecase.execute(payload);
    return { success: true };
  }
}
