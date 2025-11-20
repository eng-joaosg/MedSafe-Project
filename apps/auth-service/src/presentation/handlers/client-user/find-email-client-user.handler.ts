import { BadRequestException, Inject } from '@nestjs/common';
import type { IFindEmailClientUserUsecase } from '../../../application/contracts/i-find-email-client-user-usecase';
import { FIND_EMAIL_CLIENT_USER_USECASE } from '../../../common/utils/tokens.contants';
import { CommonLogger } from '../../../common/logger/common.logger';

export interface FindEmailPayload {
  email: string;
}

export class FindEmailClientUserHandler {
  constructor(
    @Inject(FIND_EMAIL_CLIENT_USER_USECASE)
    private readonly usecase: IFindEmailClientUserUsecase,
  ) {}

  async execute(payload: FindEmailPayload): Promise<{ emailAlreadyExists: boolean }> {
    const email = payload.email;

    CommonLogger.info('Auth', 'FIND_EMAIL_START', email);

    if (!email || !email.includes('@')) {
      throw new BadRequestException('E-mail inválido');
    }

    const exists = await this.usecase.execute(email);

    return { emailAlreadyExists: exists };
  }
}
