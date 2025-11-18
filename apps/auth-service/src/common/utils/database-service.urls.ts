import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseServiceUrls {
  constructor(private readonly config: ConfigService) {}

  private get base(): string {
    return this.config.get<string>('DATABASE_SERVICE_URL', 'http://localhost:3004');
  }

  public clientUser = {
    getByEmail: (email: string) => `${this.base}/client-user/email/${email}`,
    getById: (id: string) => `${this.base}/client-user/id/${id}`,
    findEmail: (email: string) => `${this.base}/client-user/find-email?email=${email}`,
    create: () => `${this.base}/client-user`,
    save: (userId: string) => `${this.base}/client-user/${userId}`,
  };

  public medicalRecord = {
    findById: (recordId: string) => `${this.base}/medical-records/${recordId}`,
  };
}
