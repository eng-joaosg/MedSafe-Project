import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { InvalidPasswordException } from '../../../common/exceptions/app.exception';
import type { IHashService } from '../../../domain/services/i-hash.service';
import { CLIENT_USER_REPOSITORY, HASH_SERVICE } from '../../../common/utils/tokens.contants';
import { IDeleteClientUserUseCase } from 'src/application/contracts/i-delete-client-user.usecase';

@Injectable()
export class DeleteClientUserUseCase implements IDeleteClientUserUseCase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly repository: IClientUserRepository,
    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,
  ) {}

  async execute(id: string, password: string): Promise<void> {
    const user = await this.repository.getById(id);
    if (!user) throw new UnauthorizedException('Usuário não autorizado.');
    const passwordHash = user.getPasswordHash();
    const authenticated = await this.hashService.compare(password, passwordHash);
    if (!authenticated) throw new InvalidPasswordException();
    await this.repository.delete(id);
  }
}
