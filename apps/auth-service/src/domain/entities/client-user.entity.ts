import { UserRole } from '../../common/enums/user-role.enum';
import { UserEntity } from './user.entity';

export class ClientUser extends UserEntity {
  private clinicalInfoId: string | null;
  private verificationCode: string | null;
  private codeExpiresAt: Date | null;

  constructor(
    id: string,
    email: string,
    passwordHash: string,
    clinicalInfoId: string | null,
    firstName: string,
    lastName: string,
    isActive = false,
    verificationCode: string | null,
    codeExpiresAt: Date | null,
    createdAt: Date | null,
    updatedAt: Date | null,
  ) {
    super(id, email, passwordHash, UserRole.CLIENT, firstName, lastName, isActive, createdAt, updatedAt);
    this.verificationCode = verificationCode;
    this.codeExpiresAt = codeExpiresAt;
    this.clinicalInfoId = clinicalInfoId;
  }

  public getVerificationCode(): string | null {
    return this.verificationCode;
  }

  public getCodeExpiresAt(): Date | null {
    return this.codeExpiresAt;
  }

  public getClinicalInfoId(): string | null {
    return this.clinicalInfoId;
  }

  public setVerificationCodeAndExpiresAt(code: string, codeExpiresAt: Date): void {
    this.verificationCode = code;
    this.codeExpiresAt = codeExpiresAt;
  }

  public clearVerificationCode(): void {
    this.verificationCode = null;
    this.codeExpiresAt = null;
  }

  public activeAccout(): void {
    this.verificationCode = null;
    this.codeExpiresAt = null;
    this.isActive = true;
  }

  public setClinicalInfoId(clinicalInfoId: string | null): void {
    this.clinicalInfoId = clinicalInfoId;
  }
}
