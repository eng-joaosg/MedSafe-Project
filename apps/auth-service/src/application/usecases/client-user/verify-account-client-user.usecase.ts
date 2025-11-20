import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import { VerifyAccountClientUserDto } from '../../../application/dtos/client-user/verify-account-client-user.dto';
import {
  InvalidVerificationCodeException,
  UserNotFoundException,
  VerificationCodeExpiredException,
} from '../../../common/exceptions/app.exception';
import type { INotificationService } from '../../../domain/services/i-notification.service';
import { IVerifyAccountClientUserUseCase } from '../../../application/contracts/i-verify-account-client-user-usecase';

@Injectable()
export class VerifyAccountClientUserUseCase implements IVerifyAccountClientUserUseCase {
  constructor(
    @Inject('IClientUserRepository')
    private readonly clientUserRepository: IClientUserRepository,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: VerifyAccountClientUserDto): Promise<boolean> {
    const user = await this.clientUserRepository.getByEmail(dto.email);
    if (!user) throw new UserNotFoundException();

    const userCode = user.getVerificationCode();
    const userCodeExpiresAt = user.getCodeExpiresAt();

    if (dto.verificationCode !== userCode) throw new InvalidVerificationCodeException();

    const now = new Date(Date.now());

    if (!userCodeExpiresAt || userCodeExpiresAt < now) throw new VerificationCodeExpiredException();

    user.activate();

    await this.clientUserRepository.save(user);
    await this.notificationService.sendAccountCreated(user);
    return true;
  }
}
