import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { InvalidCredentialsException, UserNotActiveException } from '../../../common/exceptions/app.exception';
import { ILoginClientUserUseCase } from '../../../application/contracts/i-login-client-user.usecase';
import { LoginClientUserDto } from '../../../application/dtos/client-user/login-client-user.dto';
import { SessionClientUserDto } from '../../../application/dtos/client-user/session-client-user.dto';
import type { ITokenService } from '../../../domain/services/i-token.service';
import type { IHashService } from '../../../domain/services/i-hash.service';
import { CLIENT_USER_MAPPER, CLIENT_USER_REPOSITORY, HASH_SERVICE, TOKEN_SERVICE } from '../../../common/utils/tokens.contants';
import type { IClientUserMapper } from '../../../application/mapping/i-client-user.mapper';

@Injectable()
export class LoginClientUserUseCase implements ILoginClientUserUseCase {
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

  async execute(dto: LoginClientUserDto): Promise<SessionClientUserDto> {
    const user = await this.repository.getByEmail(dto.email);
    if (!user) throw new InvalidCredentialsException();

    if (!user.getIsActive()) throw new UserNotActiveException();

    const passwordHash = user.getPasswordHash();
    const authenticated = await this.hashService.compare(dto.password, passwordHash);
    if (!authenticated) throw new InvalidCredentialsException();

    const token = await this.tokenService.generateClientUserAuthToken(user);

    return this.mapper.toSessionDto(user, token);
  }
}
