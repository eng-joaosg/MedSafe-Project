import { Inject } from '@nestjs/common';
import { RESET_PASSWORD_USECASE } from '../../../common/utils/tokens.contants';
import type { IResetPasswordUsecase } from 'src/application/contracts/i-reset-password.usecase';
import { ResetPasswordDto } from 'src/application/dtos/user/reset-password.dto';

export class ResetPasswordHandler {
  constructor(
    @Inject(RESET_PASSWORD_USECASE)
    private readonly usecase: IResetPasswordUsecase,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    await this.usecase.execute(dto);
  }
}
