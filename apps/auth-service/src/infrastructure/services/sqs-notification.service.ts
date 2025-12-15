import { Injectable, Inject } from '@nestjs/common';
import { INotificationService } from '../../domain/services/i-notification.service';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { RequestContextService } from '../../common/request-context/request-context.service';
import type { INotificationGateway } from '../contracts/i-notification-service.gateway';
import { NOTIFICATION_GATEWAY } from '../../common/utils/tokens.contants';
import {
  BaseMessage,
  VerificationPayload,
  PasswordRecoveryPayload,
  AccountCreatedPayload,
  PublicDataAccessPayload,
} from '../../application/events/notification.messages';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqsNotificationService implements INotificationService {
  private readonly env: string;

  constructor(
    @Inject(NOTIFICATION_GATEWAY)
    private readonly gateway: INotificationGateway,

    private readonly requestContext: RequestContextService,
    private readonly config: ConfigService,
  ) {
    this.env = this.config.get<string>('NODE_ENV') || 'development';
  }

  private getEventId(): string {
    const requestId = this.requestContext.get<string>('requestId');
    if (!requestId) {
      throw new Error('Event ID not found in request context');
    }
    return requestId;
  }

  private async sendMessage<T>(message: BaseMessage<T>): Promise<void> {
    if (this.env === 'development') {
      console.log('[DEV] Mensagem simulada:', JSON.stringify(message, null, 2));
      return;
    }

    await this.gateway.publish(message);
  }

  async sendVerification(user: ClientUser, code: string): Promise<void> {
    const message: BaseMessage<VerificationPayload> = {
      id: this.getEventId(),
      type: 'verification',
      version: 1,
      payload: {
        email: user.getEmail(),
        name: `${user.getFirstName()} ${user.getLastName()}`,
        verificationCode: code,
      },
    };
    if (this.env !== 'production') {
      console.log('================================');
      console.log('LINK:', `localhost:3000/auth/verify-account/${user.getEmail()}/${code}`);
      console.log('================================');
    }
    await this.sendMessage(message);
  }

  async sendPasswordRecovery(user: ClientUser, code: string): Promise<void> {
    const message: BaseMessage<PasswordRecoveryPayload> = {
      id: this.getEventId(),
      type: 'password_recovery',
      version: 1,
      payload: {
        email: user.getEmail(),
        name: `${user.getFirstName()} ${user.getLastName()}`,
        resetToken: code,
      },
    };
    if (this.env !== 'production') {
      console.log('==============================================================================', '\n');
      console.log('LINK:', `localhost:3000/auth/reset-password/${user.getEmail()}/${code}`, '\n');
      console.log('==============================================================================');
    }
    await this.sendMessage(message);
  }

  async sendAccountCreated(user: ClientUser): Promise<void> {
    const message: BaseMessage<AccountCreatedPayload> = {
      id: this.getEventId(),
      type: 'account_created',
      version: 1,
      payload: {
        email: user.getEmail(),
        name: `${user.getFirstName()} ${user.getLastName()}`,
      },
    };
    await this.sendMessage(message);
  }

  async sendPublicDataAccess(user: ClientUser, accessedAt: Date): Promise<void> {
    const message: BaseMessage<PublicDataAccessPayload> = {
      id: this.getEventId(),
      type: 'public_data_access',
      version: 1,
      payload: {
        email: user.getEmail(),
        name: `${user.getFirstName()} ${user.getLastName()}`,
        accessedAt: accessedAt.toISOString(),
      },
    };
    await this.sendMessage(message);
  }
}
