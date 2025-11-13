export class ClientUserDbtDto {
  id: string;
  email: string;
  passwordHash: string;
  clinicalInfoId: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  verificationCode: string | null;
  codeExpiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(
    id: string,
    email: string,
    passwordHash: string,
    clinicalInfoId: string | null,
    firstName: string,
    lastName: string,
    isActive: boolean,
    verificationCode: string | null,
    codeExpiresAt: Date | null,
    createdAt: Date | null,
    updatedAt: Date | null,
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.clinicalInfoId = clinicalInfoId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.isActive = isActive;
    this.verificationCode = verificationCode;
    this.codeExpiresAt = codeExpiresAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
