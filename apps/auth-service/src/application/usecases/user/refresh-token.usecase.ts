import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { UserNotActiveException } from '../../../common/exceptions/app.exception';
import { SessionDto } from '../../dtos/client-user/session.dto';
import type { ITokenService } from '../../../domain/services/i-token.service';
import type { IHashService } from '../../../domain/services/i-hash.service';
import { CLIENT_USER_MAPPER, CLIENT_USER_REPOSITORY, HASH_SERVICE, TOKEN_SERVICE } from '../../../common/utils/tokens.contants';
import type { IClientUserMapper } from '../../../application/mapping/i-client-user.mapper';
import { IRefreshTokenUseCase } from 'src/application/contracts/i-refresh-token.usecase';

@Injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
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

  async execute(id: string | number, role: string): Promise<SessionDto> {
    if (role === 'client') {
      const clientUser = await this.repository.getById(id.toString());
      if (!clientUser.getIsActive()) throw new UserNotActiveException();
      const token = await this.tokenService.generateClientUserAuthToken(clientUser);
      return this.mapper.toSessionDto(clientUser, token);
    }
    if (role === 'admin') {
      /////// IMPLEMENTAR
      const admin = await this.repository.getById(id.toString());
      if (!admin.getIsActive()) throw new UserNotActiveException();
      const token = await this.tokenService.generateClientUserAuthToken(admin);
      return this.mapper.toSessionDto(admin, token);
    }
    if (role === 'public') {
      const token = await this.tokenService.generatePublicAccessToken(id.toString());
      const session = new SessionDto(id.toString(), null, 'public', null, null, token, null);
      return session;
    }
    throw new UnauthorizedException('Token inválido.');
  }
}
