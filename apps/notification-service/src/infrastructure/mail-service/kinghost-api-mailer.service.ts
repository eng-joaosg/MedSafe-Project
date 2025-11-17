import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigurationException } from '../../common/exceptions/app.exception';

interface KinghostEmailPayload {
  from: string;
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class KinghostApiMailerService {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly senderEmail: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.getRequiredConfig('KINGHOST_API_BASE_URL');
    this.token = this.getRequiredConfig('KINGHOST_API_TOKEN');
    this.senderEmail = this.getRequiredConfig('KINGHOST_API_USER');
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new ConfigurationException(`Variável de ambiente obrigatória ausente: ${key}`);
    }
    return value;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const payload: KinghostEmailPayload = {
      from: this.senderEmail,
      to,
      subject,
      body: html,
    };

    const request$: Observable<AxiosResponse<any>> = this.http.post(this.baseUrl, payload, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-auth-token': this.token,
      },
    });

    const response = await firstValueFrom(request$);

    if (response.status !== 201) {
      throw new InternalServerErrorException(`Falha ao enviar email. Status recebido: ${response.status}`);
    }
  }
}
