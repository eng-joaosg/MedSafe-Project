import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { CLIENT_USER_REPOSITORY } from '../../../common/utils/tokens.contants';

@Injectable()
export class FindEmailClientUserUsecase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly clientUserRepository: IClientUserRepository,
  ) {}

  async execute(email: string): Promise<boolean> {
    return this.clientUserRepository.findEmail(email);
  }
}
