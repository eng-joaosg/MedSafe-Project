import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import type { IVerificationCodeService } from '../../../domain/services/i-verification-code.service';
import type { INotificationService } from '../../../domain/services/i-notification.service';
import { CommonLogger } from '../../../common/logger/common.logger';
import { CLIENT_USER_REPOSITORY, NOTIFICATION_SERVICE, VERIFICATION_CODE_SERVICE } from '../../../common/utils/tokens.contants';
import { INewVerificationCodeUsecase } from 'src/application/contracts/i-new-verification-code.usecase';

@Injectable()
export class NewVerificationCodeUsecase implements INewVerificationCodeUsecase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly repository: IClientUserRepository,
    @Inject(VERIFICATION_CODE_SERVICE)
    private readonly verificationCodeService: IVerificationCodeService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(email: string, type: string): Promise<void> {
    try {
      const user = await this.repository.getByEmail(email);
      if (!user) {
        CommonLogger.warn('AUTH', 'NEW_VERIFICATION_CODE', 'E-mail não encontrado na base de dados.');
        return;
      }
      const code = this.verificationCodeService.generateCode();
      const codeExpireAt = new Date(Date.now() + this.verificationCodeService.getShortExpirationTime() * 1000);
      await this.repository.newVerificationCode(user.getId().toString(), code, codeExpireAt);
      if (type === 'forgot-password') {
        await this.notificationService.sendPasswordRecovery(user, code);
      } else {
        await this.notificationService.sendVerification(user, code);
      }
      CommonLogger.info('AUTH', 'NEW_VERIFICATION_CODE', `Código enviado para ${email}`);
    } catch (err: any) {
      if (err?.status && err.status < 500) {
        CommonLogger.warn('AUTH', 'NEW_VERIFICATION_CODE', `E-mail não encontrado: ${email}`);
        return;
      }
    }
  }
}
