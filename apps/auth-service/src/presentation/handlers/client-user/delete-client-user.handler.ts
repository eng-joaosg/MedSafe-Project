import { Inject } from '@nestjs/common';
import { DELETE_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import type { IDeleteClientUserUseCase } from 'src/application/contracts/i-delete-client-user.usecase';

export class DeleteClientUserHandler {
  constructor(
    @Inject(DELETE_CLIENT_USER_USECASE)
    private readonly usecase: IDeleteClientUserUseCase,
  ) {}

  async execute(id: string, password: string): Promise<void> {
    await this.usecase.execute(id, password);
  }
}
