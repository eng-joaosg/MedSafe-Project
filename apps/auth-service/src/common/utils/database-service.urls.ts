import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseServiceUrls {
  constructor(private readonly config: ConfigService) {}

  private get base(): string {
    return this.config.get<string>('DATABASE_SERVICE_URL', 'http://localhost:5000');
  }

  public clientUser = {
    getByEmail: (email: string) => `${this.base}/client-user/by-email?email=${email}`,
    getById: (id: string) => `${this.base}/client-user/by-id?id=${id}`,
    getByClinicalInfoId: (id: string) => `${this.base}/client-user/by-clinical-info-id?id=${id}`,
    findEmail: (email: string) => `${this.base}/client-user/find-email?email=${email}`,
    create: (id: string) => `${this.base}/client-user?id=${id}`,
    save: (id: string) => `${this.base}/client-user?id=${id}`,
    delete: (id: string) => `${this.base}/client-user?id=${id}`,
  };

  public medicalRecord = {
    findById: (recordId: string) => `${this.base}/medical-records/${recordId}`,
  };
}
