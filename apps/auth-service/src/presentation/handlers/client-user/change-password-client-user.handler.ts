import { Inject } from '@nestjs/common';
import { CHANGE_PASSWORD_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import type { IChangePasswordClientUserUseCase } from '../../../application/contracts/i-change-password-client-user.usecase';

export class ChangePasswordClientUserHandler {
  constructor(
    @Inject(CHANGE_PASSWORD_CLIENT_USER_USECASE)
    private readonly usecase: IChangePasswordClientUserUseCase,
  ) {}

  async execute(id: string, password: string, newPassword: string): Promise<void> {
    await this.usecase.execute(id, password, newPassword);
  }
}
