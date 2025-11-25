import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { InvalidPasswordException } from '../../../common/exceptions/app.exception';
import { SessionClientUserDto } from '../../../application/dtos/client-user/session-client-user.dto';
import type { ITokenService } from '../../../domain/services/i-token.service';
import type { IHashService } from '../../../domain/services/i-hash.service';
import { CLIENT_USER_MAPPER, CLIENT_USER_REPOSITORY, HASH_SERVICE, TOKEN_SERVICE } from '../../../common/utils/tokens.contants';
import { IChangePasswordClientUserUseCase } from '../../../application/contracts/i-change-password-client-user.usecase';
import type { IClientUserMapper } from 'src/application/mapping/i-client-user.mapper';

@Injectable()
export class ChangePasswordClientUserUseCase implements IChangePasswordClientUserUseCase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly repository: IClientUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,
    @Inject(CLIENT_USER_MAPPER)
    private readonly mapper: IClientUserMapper,
  ) {}

  async execute(id: string, password: string, newPassword: string): Promise<SessionClientUserDto> {
    const user = await this.repository.getById(id);
    if (!user) throw new UnauthorizedException('Usuário não autorizado.');

    const passwordHash = user.getPasswordHash();
    const authenticated = await this.hashService.compare(password, passwordHash);
    if (!authenticated) throw new InvalidPasswordException();
    const newPasswordHash = await this.hashService.hash(newPassword);

    const updated = await this.repository.changePassword(id, newPasswordHash);
    const token = await this.tokenService.generateClientUserAuthToken(updated);

    return this.mapper.toSessionDto(updated, token);
  }
}
