import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DatabaseServiceUrls } from 'src/common/utils/database-service.urls';
import { ConfigurationException } from 'src/common/exceptions/app.exception';
import { ClientUserDbtDto } from 'src/application/dtos/client-user/client-user-db.dto';

@Injectable()
export class DatabaseGateway {
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly urls: DatabaseServiceUrls,
    private readonly httpService: HttpService,
  ) {
    const key = this.configService.get<string>('DATABASE_X_AUTH_API_KEY');
    if (!key) {
      throw new ConfigurationException(
        'DATABASE_X_AUTH_API_KEY não configurada.',
      );
    }
    this.apiKey = key;
  }

  private get headers(): AxiosRequestConfig['headers'] {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // ---------- CLIENT USER ----------

  public async saveClientUser(
    dto: ClientUserDbtDto,
  ): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.save(dto.id);
    const response: AxiosResponse<ClientUserDbtDto> = await lastValueFrom(
      this.httpService.patch(url, dto, { headers: this.headers }),
    );
    return response.data;
  }

  public async createClientUser(
    dto: ClientUserDbtDto,
  ): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.create();
    const response: AxiosResponse<ClientUserDbtDto> = await lastValueFrom(
      this.httpService.post(url, dto, { headers: this.headers }),
    );
    return response.data;
  }

  public async getClientUserByEmail(email: string): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.getByEmail(email);
    const response: AxiosResponse<ClientUserDbtDto> = await lastValueFrom(
      this.httpService.get(url, { headers: this.headers }),
    );
    return response.data;
  }

  public async getClientUserById(id: string): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.getById(id);
    const response: AxiosResponse<ClientUserDbtDto> = await lastValueFrom(
      this.httpService.get(url, { headers: this.headers }),
    );
    return response.data;
  }

  public async findEmail(email: string): Promise<boolean> {
    const url = this.urls.clientUser.findEmail(email);
    const response: AxiosResponse<boolean> = await lastValueFrom(
      this.httpService.get(url, { headers: this.headers }),
    );
    return response.data;
  }

  // ---------- CLINICAL INFO RECORD ----------

  public async findPublicPasswordById<T>(recordId: string): Promise<T> {
    const url = this.urls.medicalRecord.findById(recordId);
    const response: AxiosResponse<T> = await lastValueFrom(
      this.httpService.get(url, { headers: this.headers }),
    );
    return response.data;
  }
}
