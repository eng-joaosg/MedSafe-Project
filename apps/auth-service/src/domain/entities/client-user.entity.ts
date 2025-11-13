import { UserRole } from 'src/common/enums/user-role.enum';
import { UserEntity } from './user.entity';

export class ClienteUser extends UserEntity {
  private clinicalInfoId: string | null;
  private verificationCode: string | null;
  private verificationCodeExpiresAt: Date | null;

  constructor(
    id: string,
    email: string,
    passwordHash: string,
    clinicalInfoId: string | null,
    firstName: string,
    lastName: string,
    isActive = false,
    verificationCode: string | null,
    verificationCodeExpiresAt: Date | null,
    createdAt: Date | null,
    updatedAt: Date | null,
  ) {
    super(
      id,
      email,
      passwordHash,
      UserRole.CLIENT,
      firstName,
      lastName,
      isActive,
      createdAt,
      updatedAt,
    );
    this.verificationCode = verificationCode;
    this.verificationCodeExpiresAt = verificationCodeExpiresAt;
    this.clinicalInfoId = clinicalInfoId;
  }

  public getVerificationCode(): string | null {
    return this.verificationCode;
  }

  public getCodeExpiresAt(): Date | null {
    return this.verificationCodeExpiresAt;
  }

  public getClinicalInfoId(): string | null {
    return this.clinicalInfoId;
  }

  public setVerificationCodeAndExpiresAt(code: string, expiresAt: Date): void {
    this.verificationCode = code;
    this.verificationCodeExpiresAt = expiresAt;
  }

  public clearVerificationCode(): void {
    this.verificationCode = null;
    this.verificationCodeExpiresAt = null;
  }

  public setClinicalInfoId(clinicalInfoId: string | null): void {
    this.clinicalInfoId = clinicalInfoId;
  }
}
