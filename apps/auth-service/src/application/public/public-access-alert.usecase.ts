import { Inject, Injectable } from '@nestjs/common';
import { IPublicAccessAlertUseCase } from '../contracts/i-public-access-alert.usecase';
import { CommonLogger } from '../../common/logger/common.logger';
import type { IClientUserRepository } from '../../domain/repositories/i-client-user.repository';
import type { INotificationService } from '../../domain/services/i-notification.service';
import { CLIENT_USER_REPOSITORY, NOTIFICATION_SERVICE } from '../../common/utils/tokens.contants';

@Injectable()
export class PublicAccessAlertUseCase implements IPublicAccessAlertUseCase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly repository: IClientUserRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const user = await this.repository.getByClinicalInfoId(id);
      if (!user) {
        CommonLogger.warn('AUTH', 'PUBLIC_ACCESS_ALERT', 'E-mail não encontrado na base de dados.');
        return;
      }
      const now = new Date(Date.now());
      await this.notificationService.sendPublicDataAccess(user, now);
      CommonLogger.info('AUTH', 'PUBLIC_ACCESS_ALERT', `Alerta enviado para ${user.getEmail()}`);
    } catch (err: any) {
      if (err?.status && err.status < 500) {
        CommonLogger.warn('AUTH', 'PUBLIC_ACCESS_ALERT', 'Usuário não encontrado.');
        return;
      }
    }
  }
}
