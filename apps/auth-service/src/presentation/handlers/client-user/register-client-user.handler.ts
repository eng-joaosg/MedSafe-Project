import { Inject } from '@nestjs/common';
import type { IRegisterClientUserUsecase } from 'src/application/contracts/i-register-client-user-usecase';
import { REGISTER_CLIENT_USER_USECASE } from 'src/common/utils/tokens.contants';
import { RegisterClientUserDto } from 'src/application/dtos/client-user/register-client-user.dto';
import { CommonLogger } from 'src/common/logger/common.logger';

export class RegisterClientUserHandler {
  constructor(
    @Inject(REGISTER_CLIENT_USER_USECASE)
    private readonly usecase: IRegisterClientUserUsecase,
  ) {}

  async execute(payload: RegisterClientUserDto) {
    try {
      CommonLogger.info('Auth', 'REGISTER_CLIENT_USER_START', {
        email: payload.email,
      });

      await this.usecase.execute(payload);

      return {
        statusCode: 204,
        body: null,
      };
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      if (errorMessage.includes('inválido')) {
        return { statusCode: 400, body: JSON.stringify({ error: errorMessage }) };
      }
      if (errorMessage.includes('já registrado')) {
        return { statusCode: 409, body: JSON.stringify({ error: errorMessage }) };
      }

      return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
    }
  }
}
