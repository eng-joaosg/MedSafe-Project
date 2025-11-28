import { Inject } from '@nestjs/common';
import { CHANGE_NAME_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import type { IChangeNameClientUserUseCase } from 'src/application/contracts/i-change-name-client-user.usecase';
import { SessionClientUserDto } from '../../../application/dtos/client-user/session-client-user.dto';

export class ChangeNameClientUserHandler {
  constructor(
    @Inject(CHANGE_NAME_CLIENT_USER_USECASE)
    private readonly usecase: IChangeNameClientUserUseCase,
  ) {}

  async execute(id: string, newFirstName: string, newLastName: string): Promise<SessionClientUserDto> {
    return await this.usecase.execute(id, newFirstName, newLastName);
  }
}
