import { BaseEntity } from './base.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export abstract class UserEntity extends BaseEntity {
  protected email: string;
  protected passwordHash: string;
  protected role: UserRole;
  protected isActive: boolean;
  protected firstName: string;
  protected lastName: string;

  constructor(
    id: string | number,
    email: string,
    passwordHash: string,
    role: UserRole,
    firstName: string,
    lastName: string,
    isActive = true,
    createdAt: Date | null,
    updatedAt: Date | null,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.firstName = firstName;
    this.lastName = lastName;
    this.isActive = isActive;
  }

  public getEmail(): string {
    return this.email;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }

  public setPasswordHash(newHash: string): void {
    this.passwordHash = newHash;
  }

  public activate(): void {
    this.isActive = true;
  }
}
