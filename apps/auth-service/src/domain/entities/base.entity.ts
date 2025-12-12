export abstract class BaseEntity {
  protected readonly id: string | number;
  protected createdAt: Date | null;
  protected updatedAt: Date | null;

  constructor(id: string | number, createdAt: Date | null, updatedAt: Date | null) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getId(): string | number {
    return this.id;
  }

  public getCreatedAt(): Date | null {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | null {
    return this.updatedAt;
  }

  protected updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
