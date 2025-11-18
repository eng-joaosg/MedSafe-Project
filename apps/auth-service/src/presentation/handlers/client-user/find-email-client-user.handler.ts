import { Inject } from '@nestjs/common';
import type { IFindEmailClientUserUsecase } from 'src/application/contracts/i-find-email-client-user-usecase';
import { FIND_EMAIL_CLIENT_USER_USECASE } from 'src/common/utils/tokens.contants';
import { CommonLogger } from 'src/common/logger/common.logger';

interface FindEmailPayload {
  email: string;
}

export class FindEmailClientUserHandler {
  constructor(
    @Inject(FIND_EMAIL_CLIENT_USER_USECASE)
    private readonly usecase: IFindEmailClientUserUsecase,
  ) {}

  async execute(payload: FindEmailPayload) {
    try {
      const email: string = payload.email;

      CommonLogger.info('Auth', 'FIND_EMAIL', email);

      if (!email || !email.includes('@')) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'E-mail inválido' }),
        };
      }

      const alreadyExists = await this.usecase.execute(email);

      return {
        statusCode: 200,
        body: JSON.stringify({ emailAlreadyExists: alreadyExists }),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errorMessage }),
      };
    }
  }
}
