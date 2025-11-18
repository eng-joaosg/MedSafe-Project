/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { KinghostApiMailerService } from './kinghost-api-mailer.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigurationException } from '../../common/exceptions/app.exception';
import { InternalServerErrorException } from '@nestjs/common';

describe('KinghostApiMailerService', () => {
  let service: KinghostApiMailerService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'KINGHOST_API_BASE_URL') return 'https://api.example.com';
      if (key === 'KINGHOST_API_TOKEN') return 'token';
      if (key === 'KINGHOST_API_USER') return 'user@example.com';
      return undefined;
    }),
  };

  const mockHttp = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: KinghostApiMailerService,
          useFactory: () => new KinghostApiMailerService(mockHttp as any, mockConfig as any),
        },
        { provide: ConfigService, useValue: mockConfig },
        { provide: HttpService, useValue: mockHttp },
      ],
    }).compile();

    service = module.get(KinghostApiMailerService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('throws ConfigurationException if a required config is missing', () => {
      mockConfig.get.mockReturnValueOnce(undefined);

      expect(() => new KinghostApiMailerService(mockHttp as any, mockConfig as any)).toThrow(ConfigurationException);
    });
  });

  describe('sendEmail', () => {
    const to = 'to@example.com';
    const subject = 'Subject';
    const html = '<p>Body</p>';

    it('sends email successfully', async () => {
      const axiosResponse: AxiosResponse = {
        data: {},
        status: 201,
        statusText: 'Created',
        headers: {},
        config: { headers: {} } as any,
      };

      mockHttp.post.mockReturnValueOnce(of(axiosResponse));

      await expect(service.sendEmail(to, subject, html)).resolves.not.toThrow();

      expect(mockHttp.post).toHaveBeenCalledWith(
        'https://api.example.com',
        {
          from: 'user@example.com',
          to,
          subject,
          body: html,
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-auth-token': 'token',
          }),
        }),
      );
    });

    it('throws InternalServerErrorException if status is not 201', async () => {
      const axiosResponse: AxiosResponse = {
        data: {},
        status: 500,
        statusText: 'Error',
        headers: {},
        config: { headers: {} } as any,
      };

      mockHttp.post.mockReturnValueOnce(of(axiosResponse));

      await expect(service.sendEmail(to, subject, html)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
