import { Inject } from '@nestjs/common';
import { CHANGE_PASSWORD_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import { SessionDto } from '../../../application/dtos/client-user/session.dto';
import type { IChangePasswordClientUserUseCase } from 'src/application/contracts/i-change-password-client-user.usecase';

export class ChangePasswordClientUserHandler {
  constructor(
    @Inject(CHANGE_PASSWORD_CLIENT_USER_USECASE)
    private readonly usecase: IChangePasswordClientUserUseCase,
  ) {}

  async execute(id: string, password: string, newPassword: string): Promise<SessionDto> {
    return await this.usecase.execute(id, password, newPassword);
  }
}
