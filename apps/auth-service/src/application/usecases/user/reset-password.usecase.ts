import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserMapper } from '../../../application/mapping/i-client-user.mapper';
import type { IHashService } from '../../../domain/services/i-hash.service';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import type { IVerificationCodeService } from '../../../domain/services/i-verification-code.service';
import type { INotificationService } from '../../../domain/services/i-notification.service';
import { IResetPasswordUsecase } from 'src/application/contracts/i-reset-password.usecase';
import { ResetPasswordDto } from 'src/application/dtos/user/reset-password.dto';
import { ClientUser } from '../../../domain/entities/client-user.entity';
import { CommonLogger } from '../../../common/logger/common.logger';
import {
  InvalidVerificationCodeException,
  UserNotFoundException,
  VerificationCodeExpiredException,
} from '../../../common/exceptions/app.exception';
import {
  CLIENT_USER_MAPPER,
  CLIENT_USER_REPOSITORY,
  HASH_SERVICE,
  NOTIFICATION_SERVICE,
  VERIFICATION_CODE_SERVICE,
} from '../../../common/utils/tokens.contants';

@Injectable()
export class ResetPasswordUsecase implements IResetPasswordUsecase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly clientUserRepository: IClientUserRepository,
    @Inject(CLIENT_USER_MAPPER)
    private readonly clientUSerMapper: IClientUserMapper,
    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,
    @Inject(VERIFICATION_CODE_SERVICE)
    private readonly verificationCodeService: IVerificationCodeService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    let user: ClientUser;
    try {
      user = await this.clientUserRepository.getByEmail(dto.email);
    } catch (err: any) {
      if (err?.status && err.status >= 500) {
        throw err;
      }
      throw new UserNotFoundException(`Usuário com e-mail ${dto.email} não encontrado`);
    }
    if (!user) {
      throw new UserNotFoundException(`Usuário com e-mail ${dto.email} não encontrado`);
    }

    const now = new Date();
    const userCode = user.getVerificationCode();
    const userCodeExpiresAt = user.getCodeExpiresAt();

    if (dto.verificationCode !== userCode) throw new InvalidVerificationCodeException();
    if (!userCodeExpiresAt || userCodeExpiresAt < now) throw new VerificationCodeExpiredException();

    const passwordHash = await this.hashService.hash(dto.newPassword);

    const updated = await this.clientUserRepository.resetePassword(user.getId().toString(), passwordHash);
    CommonLogger.info('Auth', 'RESET_PASSWORD_SUCCESS', {
      email: updated.getEmail(),
    });
  }
}
