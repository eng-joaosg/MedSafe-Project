import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { VerifyAccountClientUserDto } from '../../../application/dtos/client-user/verify-account-client-user.dto';
import {
  InvalidVerificationCodeException,
  UserNotFoundException,
  VerificationCodeExpiredException,
} from '../../../common/exceptions/app.exception';
import type { INotificationService } from '../../../domain/services/i-notification.service';
import { IVerifyAccountClientUserUseCase } from '../../contracts/i-verify-account-client-user.usecase';
import { CLIENT_USER_REPOSITORY, NOTIFICATION_SERVICE } from '../../../common/utils/tokens.contants';
import { ClientUser } from '../../../domain/entities/client-user.entity';

@Injectable()
export class VerifyAccountClientUserUseCase implements IVerifyAccountClientUserUseCase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly clientUserRepository: IClientUserRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: VerifyAccountClientUserDto): Promise<boolean> {
    let user: ClientUser;
    try {
      user = await this.clientUserRepository.getByEmail(dto.email);
    } catch (err: any) {
      if (err?.status && err.status >= 500) {
        throw err;
      }
      throw new UserNotFoundException(`Usuário com e-mail ${dto.email} não encontrado`);
    }

    if (!user) throw new UserNotFoundException();

    const userCode = user.getVerificationCode();
    const userCodeExpiresAt = user.getCodeExpiresAt();

    if (dto.verificationCode !== userCode) throw new InvalidVerificationCodeException();

    const now = new Date();

    if (!userCodeExpiresAt || userCodeExpiresAt < now) throw new VerificationCodeExpiredException();
    user.activate();

    const updated = await this.clientUserRepository.activate(user.getId().toString());
    await this.notificationService.sendAccountCreated(updated);

    return true;
  }
}
