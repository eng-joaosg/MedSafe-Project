import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { SessionClientUserDto } from '../../../application/dtos/client-user/session-client-user.dto';
import type { ITokenService } from '../../../domain/services/i-token.service';
import type { IHashService } from '../../../domain/services/i-hash.service';
import { CLIENT_USER_MAPPER, CLIENT_USER_REPOSITORY, HASH_SERVICE, TOKEN_SERVICE } from '../../../common/utils/tokens.contants';
import type { IClientUserMapper } from '../../../application/mapping/i-client-user.mapper';
import { IChangeNameClientUserUseCase } from '../../../application/contracts/i-change-name-client-user.usecase';

@Injectable()
export class ChangeNameClientUserUseCase implements IChangeNameClientUserUseCase {
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

  async execute(id: string, newFirstName: string, newLastName: string): Promise<SessionClientUserDto> {
    if (!newFirstName || !newLastName) throw new BadRequestException();

    const user = await this.repository.getById(id);
    if (!user) throw new UnauthorizedException('Usuário não autorizado.');

    const updated = await this.repository.changeName(id, newFirstName, newLastName);
    const token = await this.tokenService.generateClientUserAuthToken(updated);

    return this.mapper.toSessionDto(updated, token);
  }
}
