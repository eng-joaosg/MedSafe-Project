import { Inject } from '@nestjs/common';
import type { ILoginClientUserUseCase } from '../../../application/contracts/i-login-client-user.usecase';
import { LOGIN_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import { LoginClientUserDto } from '../../../application/dtos/client-user/login-client-user.dto';
import { SessionDto } from 'src/application/dtos/client-user/session.dto';

export class LoginClientUserHandler {
  constructor(
    @Inject(LOGIN_CLIENT_USER_USECASE)
    private readonly usecase: ILoginClientUserUseCase,
  ) {}

  async execute(dto: LoginClientUserDto): Promise<SessionDto> {
    return this.usecase.execute(dto);
  }
}
