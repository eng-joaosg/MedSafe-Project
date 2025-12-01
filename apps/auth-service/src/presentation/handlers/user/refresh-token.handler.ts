import { Inject } from '@nestjs/common';
import type { IRefreshTokenUseCase } from '../../../application/contracts/i-refresh-token.usecase';
import { SessionDto } from '../../../application/dtos/client-user/session.dto';
import { REFRESH_TOKEN_USECASE } from '../../../common/utils/tokens.contants';

export class RefreshTokenHandler {
  constructor(
    @Inject(REFRESH_TOKEN_USECASE)
    private readonly usecase: IRefreshTokenUseCase,
  ) {}

  async execute(id: string | number, role: string): Promise<SessionDto> {
    return this.usecase.execute(id, role);
  }
}
