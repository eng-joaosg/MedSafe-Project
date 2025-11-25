import { Inject } from '@nestjs/common';
import type { IRegisterClientUserUsecase } from '../../../application/contracts/i-register-client-user.usecase';
import { REGISTER_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import { RegisterClientUserDto } from '../../../application/dtos/client-user/register-client-user.dto';

export class RegisterClientUserHandler {
  constructor(
    @Inject(REGISTER_CLIENT_USER_USECASE)
    private readonly usecase: IRegisterClientUserUsecase,
  ) {}

  async execute(payload: RegisterClientUserDto): Promise<{ success: boolean }> {
    await this.usecase.execute(payload);
    return { success: true };
  }
}
