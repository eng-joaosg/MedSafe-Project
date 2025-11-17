export type NotificationType = 'verification' | 'password_recovery' | 'account_created' | 'public_data_access';

export interface BaseMessage<TPayload = unknown> {
  id: string;
  type: NotificationType;
  version: number;
  payload: TPayload;
}

export interface VerificationPayload {
  email: string;
  name: string;
  verificationCode: string;
}

export interface PasswordRecoveryPayload {
  email: string;
  name: string;
  resetToken: string;
}

export interface AccountCreatedPayload {
  email: string;
  name: string;
}

export interface PublicDataAccessPayload {
  email: string;
  name: string;
  accessedAt: string;
}
