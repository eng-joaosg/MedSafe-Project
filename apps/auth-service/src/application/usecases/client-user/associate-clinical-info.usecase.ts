import { Inject, Injectable } from '@nestjs/common';
import type { IAssociateClinicalInfoUsecase } from '../../../application/contracts/i-associate-clinical-info.usecase';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { SessionDto } from '../../dtos/client-user/session.dto';
import { CLIENT_USER_REPOSITORY, CLIENT_USER_MAPPER, TOKEN_SERVICE } from '../../../common/utils/tokens.contants';
import type { IClientUserMapper } from '../../../application/mapping/i-client-user.mapper';
import { ClinicalInfoAlreadyAssociatedException, UserNotFoundException } from '../../../common/exceptions/app.exception';
import type { ITokenService } from '../../../domain/services/i-token.service';

@Injectable()
export class AssociateClinicalInfoUsecase implements IAssociateClinicalInfoUsecase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly clientUserRepository: IClientUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    @Inject(CLIENT_USER_MAPPER)
    private readonly mapper: IClientUserMapper,
  ) {}

  async execute(clientUserId: string, clinicalInfoId: string): Promise<SessionDto> {
    const user = await this.clientUserRepository.getById(clientUserId);
    if (!user) throw new UserNotFoundException(`Usuário com ID ${clientUserId} não encontrado`);
    if (user.getClinicalInfoId()) throw new ClinicalInfoAlreadyAssociatedException();
    user.setClinicalInfoId(clinicalInfoId);
    const updated = await this.clientUserRepository.associateClinicalInfo(clientUserId, clinicalInfoId);
    const token = await this.tokenService.generateClientUserAuthToken(updated);

    return this.mapper.toSessionDto(updated, token);
  }
}
