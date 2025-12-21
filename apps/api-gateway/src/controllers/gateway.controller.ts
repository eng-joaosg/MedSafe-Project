/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthServiceInvoker, GatewayResponse } from '../services/auth-service.invoker';
import { RegisterClientUserDto } from '../dtos/register-client-user.dto';
import { VerifyAccountClientUserDto } from '../dtos/verify-client-user.dto';
import { LoginClientUserDto } from '../dtos/login-client-user.dto';
import { ChangePasswordClientUserDto } from '../dtos/change-password-client-user.dto';
import { ChangeNameClientUserDto } from 'src/dtos/change-name-client-user.dto';
import axios from 'axios';
import type { Response } from 'express';
import { Controller, Get, Post, Patch, Body, Query, Headers, HttpCode, HttpStatus, Res, Delete, Put } from '@nestjs/common';
import { CommonLoggerGateway } from '../common/common.logger';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly invoker: AuthServiceInvoker) {}

  private databaseServiceUrl = 'http://localhost:5000';

  // ================= Helper para invocar AuthService =================
  private async invokeAndHandle<T>(
    rawPath: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    payload: any,
    requestId: string,
    authToken?: string,
    cookieHeader?: string,
    queryParams?: Record<string, string | number | boolean>,
  ): Promise<GatewayResponse<T>> {
    const response = await this.invoker.invoke<T>(rawPath, method, payload, requestId, authToken, cookieHeader ?? '', queryParams);

    const { statusCode, body, headers, cookies } = response;
    return { statusCode, body, headers, cookies };
  }

  // ================= Helper para invocar DatabaseService =================
  private async handleDatabaseServiceCall(
    method: 'get' | 'post' | 'patch' | 'delete' | 'put',
    path: string,
    requestId: string,
    cookieHeader?: string,
    payload?: any,
  ) {
    try {
      const url = `${this.databaseServiceUrl}${path}`;
      const headers: Record<string, string> = { 'x-request-id': requestId };
      if (cookieHeader) headers['cookie'] = cookieHeader;
      const config: any = { headers };
      const isQrCodePath = path.includes('qr-code');
      if (isQrCodePath) {
        config.responseType = 'arraybuffer';
      }
      let response;
      if (method === 'get' || method === 'delete') {
        response = await axios[method](url, config);
      } else {
        response = await axios[method](url, payload, config);
      }
      let finalData = response.data;
      if (isQrCodePath && finalData instanceof ArrayBuffer) {
        finalData = Buffer.from(finalData);
      }
      return { data: finalData, headers: response.headers };
    } catch (error: any) {
      if (error.response) {
        return { data: error.response.data, headers: error.response.headers };
      }
      return { data: { message: error.message }, headers: {} };
    }
  }

  // ================= Helper para repassar headers e cookies =================
  private applyHeadersToResponse(res: Response, headers?: Record<string, string | string[]>, cookies?: string[]) {
    // Headers normais
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (!value) continue;

        if (Array.isArray(value)) {
          value.forEach((v) => res.append(key, v));
        } else {
          res.setHeader(key, value);
        }
      }
    }

    // 🍪 Cookies (adaptados para DEV)
    if (cookies?.length) {
      cookies.forEach((cookie) => {
        const sanitizedCookie = this.sanitizeDevCookie(cookie);
        res.append('Set-Cookie', sanitizedCookie);
      });
    }
  }

  private sanitizeDevCookie(cookie: string): string {
    return cookie
      .replace(/;\s*Secure/gi, '')
      .replace(/;\s*SameSite=None/gi, '')
      .replace(/;\s*Domain=[^;]+/gi, '');
  }

  // ================= Helper para garantir objeto JSON =================
  private parseBody<T>(body: any): T {
    return typeof body === 'string' ? JSON.parse(body) : body;
  }

  // ================= Auth-Service Routes =================
  @Get('auth/client-user/find-email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  async findEmail(
    @Query('email') email: string,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'FIND_EMAIL', email, requestId);

    const { headers, body } = await this.invokeAndHandle('/auth/client-user/find-email', 'GET', undefined, requestId, undefined, cookie, {
      email,
    });

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(body);
  }

  @Post('auth/client-user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra um novo usuário' })
  async register(
    @Body() dto: RegisterClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'REGISTER', dto.email, requestId);

    const { headers, body } = await this.invokeAndHandle('/auth/client-user/register', 'POST', dto, requestId, undefined, cookie);

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(body);
  }

  @Post('auth/client-user/verify-account')
  @ApiOperation({ summary: 'Verifica o código de ativação da conta' })
  async verifyAccount(
    @Body() dto: VerifyAccountClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'VERIFY_ACCOUNT', dto.email, requestId);

    const { headers, body } = await this.invokeAndHandle('/auth/client-user/verify-account', 'POST', dto, requestId, undefined, cookie);

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(body);
  }

  @Post('auth/client-user/login')
  @ApiOperation({ summary: 'Login do usuário' })
  async login(
    @Body() dto: LoginClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'LOGIN', dto.email, requestId);

    const { headers, cookies, body, statusCode } = await this.invokeAndHandle(
      '/auth/client-user/login',
      'POST',
      dto,
      requestId,
      undefined,
      cookie,
    );

    this.applyHeadersToResponse(res, headers, cookies);
    res.status(statusCode ?? 200);

    return this.parseBody(body);
  }

  @Post('auth/verify-password')
  @ApiOperation({ summary: 'Verifica a senha do usuário' })
  async verifyPassword(
    @Body() body: { password: string },
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'VERIFY_PASSWORD', 'N/A', requestId);

    const { headers, body: responseBody } = await this.invokeAndHandle('/auth/verify-password', 'POST', body, requestId, undefined, cookie);

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(responseBody);
  }

  @Post('auth/new-verification-code')
  async generateVerificationCode(
    @Body() body: { email: string },
    @Query('type') type: 'verify-account' | 'forgot-password',
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'GENERATE_VERIFICATION_CODE', `${body.email} | type: ${type}`, requestId);

    const { headers, body: responseBody } = await this.invokeAndHandle(
      '/auth/new-verification-code',
      'POST',
      body,
      requestId,
      undefined,
      cookie,
      { type },
    );

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(responseBody);
  }

  @Post('auth/reset-password')
  async resetPassword(
    @Body() body: { email: string; verificationCode: string; newPassword: string },
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'RESET_PASSWORD', `Reset de senha solicitado para ${body.email}`, requestId);

    const { headers, body: responseBody } = await this.invokeAndHandle('/auth/reset-password', 'POST', body, requestId, undefined, cookie);

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(responseBody);
  }

  @Post('auth/refresh-token')
  async refreshToken(
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'REFRESH_TOKEN', 'N/A', requestId);

    const { headers, cookies, body, statusCode } = await this.invokeAndHandle(
      '/auth/refresh-token',
      'POST',
      null,
      requestId,
      undefined,
      cookie,
    );

    this.applyHeadersToResponse(res, headers, cookies);
    res.status(statusCode ?? 200);

    return this.parseBody(body);
  }

  @Patch('auth/change-password')
  @HttpCode(204)
  async changePassword(
    @Body() dto: ChangePasswordClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'CHANGE_PASSWORD', 'N/A', requestId);

    const { headers, cookies, body, statusCode } = await this.invokeAndHandle(
      '/auth/change-password',
      'PATCH',
      dto,
      requestId,
      undefined,
      cookie,
    );

    this.applyHeadersToResponse(res, headers, cookies);
    res.status(statusCode ?? 204);

    return this.parseBody(body);
  }

  @Patch('auth/client-user/associate-clinical-info')
  async associateClinicalInfo(
    @Query('clinicalInfoId') clinicalInfoId: string,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'ASSOCIATE_CLINICAL_INFO', requestId);

    const { headers, cookies, body, statusCode } = await this.invokeAndHandle(
      '/auth/client-user/associate-clinical-info',
      'PATCH',
      null,
      requestId,
      undefined,
      cookie,
      { clinicalInfoId },
    );

    this.applyHeadersToResponse(res, headers, cookies);
    res.status(statusCode ?? 200);

    return this.parseBody(body);
  }

  @Patch('auth/client-user/change-name')
  async changeName(
    @Body() dto: ChangeNameClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'CHANGE_NAME', 'N/A', requestId);

    const { headers, cookies, body, statusCode } = await this.invokeAndHandle(
      '/auth/client-user/change-name',
      'PATCH',
      dto,
      requestId,
      undefined,
      cookie,
    );

    this.applyHeadersToResponse(res, headers, cookies);
    res.status(statusCode ?? 200);

    return this.parseBody(body);
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Encaminha logout para o auth-service' })
  async logout(@Headers('x-request-id') requestId: string, @Headers('cookie') cookie: string, @Res({ passthrough: true }) res: Response) {
    CommonLoggerGateway.logStart('Gateway', 'LOGOUT', 'N/A', requestId);

    const { headers, body } = await this.invokeAndHandle('/auth/logout', 'POST', null, requestId, undefined, cookie);

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(body);
  }

  @Delete('auth/client-user/delete-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @Body() dto: { password: string },
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'DELETE_ACCOUNT', 'N/A', requestId);

    const { headers, body } = await this.invokeAndHandle('/auth/client-user/delete-account', 'DELETE', dto, requestId, undefined, cookie);

    this.applyHeadersToResponse(res, headers);
    return this.parseBody(body);
  }

  // ================= Database-Service Routes =================
  @Get('clinical-info/all')
  async getAllClinicalInfo(
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'GET_ALL_CLINICAL_INFO', 'N/A', requestId);
    const { data, headers } = await this.handleDatabaseServiceCall('get', '/clinical-info/all', requestId, cookie);
    this.applyHeadersToResponse(res, headers);
    return data;
  }

  @Get('clinical-info')
  async getClinicalInfo(
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'GET_CLINICAL_INFO', 'N/A', requestId);
    const { data, headers } = await this.handleDatabaseServiceCall('get', `/clinical-info`, requestId, cookie);
    this.applyHeadersToResponse(res, headers);
    return data;
  }

  @Get('clinical-info/qr-code')
  async getQrCode(@Headers('x-request-id') requestId: string, @Headers('cookie') cookie: string, @Res() res: Response) {
    const { data, headers } = await this.handleDatabaseServiceCall('get', `/clinical-info/qr-code`, requestId, cookie);
    this.applyHeadersToResponse(res, headers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qr_code.pdf"');
    res.setHeader('Content-Length', data.length);
    res.send(data);
  }

  @Post('clinical-info')
  async createClinicalInfo(
    @Body() payload: any,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'CREATE_CLINICAL_INFO', 'N/A', requestId);
    const { data, headers } = await this.handleDatabaseServiceCall('post', `/clinical-info`, requestId, cookie, payload);
    this.applyHeadersToResponse(res, headers);
    return data;
  }

  @Put('clinical-info')
  async putClinicalInfo(
    @Body() partial: any,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'PUT_CLINICAL_INFO', 'N/A', requestId);
    const { data, headers } = await this.handleDatabaseServiceCall('put', `/clinical-info`, requestId, cookie, partial);
    this.applyHeadersToResponse(res, headers);
    return data;
  }

  @Delete('clinical-info')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClinicalInfo(
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'DELETE_CLINICAL_INFO', 'N/A', requestId);
    const { data, headers } = await this.handleDatabaseServiceCall('delete', `/clinical-info`, requestId, cookie);
    this.applyHeadersToResponse(res, headers);
    return data;
  }

  // ================= Public Data Routes =================
  @Post('auth/clinical-info-access-alert')
  @ApiOperation({ summary: 'Dispara alerta de acesso público para o auth-service' })
  async publicDataAccessAlert(
    @Query('id') id: string,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'PUBLIC_DATA_ACCESS_ALERT', id, requestId);
    const { headers, body } = await this.invokeAndHandle('/auth/clinical-info-access-alert', 'POST', null, requestId, undefined, cookie, {
      id,
    });
    this.applyHeadersToResponse(res, headers);
    return this.parseBody(body);
  }

  @Get('public/clinical-info')
  @ApiOperation({ summary: 'Busca informações clínicas públicas pelo código' })
  async getPublicData(
    @Query('id') id: string,
    @Query('code') code: string,
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'GET_PUBLIC_DATA', id, requestId);
    const { data, headers } = await this.handleDatabaseServiceCall(
      'get',
      `/public/clinical-info?id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`,
      requestId,
    );
    this.applyHeadersToResponse(res, headers);
    return data;
  }
}
