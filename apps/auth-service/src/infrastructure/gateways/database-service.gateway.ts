import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map, Observable } from 'rxjs';
import { DatabaseServiceUrls } from '../../common/utils/database-service.urls';
import { ConfigurationException } from '../../common/exceptions/app.exception';
import { ClientUserDbtDto } from '../../application/dtos/client-user/client-user-db.dto';
import { RequestContextService } from '../../common/request-context/request-context.service';
import { IDatabaseGateway } from '../contracts/i-database-service.gateway';

@Injectable()
export class DatabaseGateway implements IDatabaseGateway {
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly urls: DatabaseServiceUrls,
    private readonly httpService: HttpService,
    private readonly requestContext: RequestContextService,
  ) {
    const key = this.configService.get<string>('DATABSE_SERVICE_X_AUTH_SERVICE_API_KEY');
    if (!key) {
      throw new ConfigurationException('DATABSE_SERVICE_X_AUTH_SERVICE_API_KEY não configurada.');
    }
    this.apiKey = key;
  }

  private get headers() {
    const requestId = this.requestContext.get<string>('requestId');
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...(requestId ? { 'x-request-id': requestId } : {}),
    };
  }

  // ---------- CLIENT USER ----------
  public async saveClientUser(id: string, dto: ClientUserDbtDto): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.save(id);
    const observable$: Observable<ClientUserDbtDto> = this.httpService
      .patch(url, dto, { headers: this.headers })
      .pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }

  public async createClientUser(id: string, dto: ClientUserDbtDto): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.create(id);
    const observable$: Observable<ClientUserDbtDto> = this.httpService
      .post(url, dto, { headers: this.headers })
      .pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }

  public async getClientUserByEmail(email: string): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.getByEmail(email);
    const observable$: Observable<ClientUserDbtDto> = this.httpService.get(url, { headers: this.headers }).pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }

  public async getClientUserById(id: string): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.getById(id);
    const observable$: Observable<ClientUserDbtDto> = this.httpService.get(url, { headers: this.headers }).pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }

  public async getClientUserByClinicalInfoId(id: string): Promise<ClientUserDbtDto> {
    const url = this.urls.clientUser.getByClinicalInfoId(id);
    const observable$: Observable<ClientUserDbtDto> = this.httpService.get(url, { headers: this.headers }).pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }

  public async findEmail(email: string): Promise<boolean> {
    const url = this.urls.clientUser.findEmail(email);
    const observable$: Observable<boolean> = this.httpService.get(url, { headers: this.headers }).pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }

  public async deleteClientUser(id: string): Promise<void> {
    if (!id) throw new Error('ID do usuário é obrigatório para exclusão.');

    const url = this.urls.clientUser.delete(id);
    const observable$: Observable<void> = this.httpService.delete(url, { headers: this.headers }).pipe(map(() => undefined));
    return await lastValueFrom(observable$);
  }

  // ---------- CLINICAL INFO RECORD ----------
  public async findPublicPasswordById<T>(recordId: string): Promise<T> {
    const url = this.urls.medicalRecord.findById(recordId);
    const observable$: Observable<T> = this.httpService.get(url, { headers: this.headers }).pipe(map((res) => res.data));
    return await lastValueFrom(observable$);
  }
}
