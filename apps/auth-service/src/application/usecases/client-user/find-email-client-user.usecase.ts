import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';

@Injectable()
export class findEmailClientUserUsecase {
  constructor(
    @Inject('IClientUserRepository')
    private readonly clientUserRepository: IClientUserRepository,
  ) {}

  async execute(email: string): Promise<boolean> {
    return this.clientUserRepository.findEmail(email);
  }
}
