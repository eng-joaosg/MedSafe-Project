import { Injectable, Inject } from '@nestjs/common';
import { INotificationService } from 'src/domain/services/i-notification.service';
import { ClientUser } from 'src/domain/entities/client-user.entity';
import type { INotificationGateway } from '../contracts/i-notification-service.gateway';

import {
  BaseMessage,
  VerificationPayload,
  PasswordRecoveryPayload,
  AccountCreatedPayload,
  PublicDataAccessPayload,
} from 'src/application/events/notification.messages';
import { RequestContextService } from 'src/common/request-context/request-context.service';

@Injectable()
export class SqsNotificationService implements INotificationService {
  constructor(
    @Inject('INotificationGateway')
    private readonly gateway: INotificationGateway,

    private readonly requestContext: RequestContextService,
  ) {}

  private getEventId(): string {
    const requestId = this.requestContext.get<string>('requestId');
    if (!requestId) {
      throw new Error('Event ID not found in request context');
    }
    return requestId;
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

    await this.gateway.publish(message);
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

    await this.gateway.publish(message);
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

    await this.gateway.publish(message);
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

    await this.gateway.publish(message);
  }
}
