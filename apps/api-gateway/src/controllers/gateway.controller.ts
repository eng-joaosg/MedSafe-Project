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

  private async invokeAndHandle<T>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    payload: any,
    requestId: string,
    authToken?: string,
    cookieHeader?: string,
    queryParams?: Record<string, string | number | boolean>,
  ): Promise<GatewayResponse<T>> {
    const { statusCode, body, headers } = await this.invoker.invoke<T>(
      path,
      method,
      payload,
      requestId,
      authToken,
      cookieHeader,
      queryParams,
    );
    return { statusCode, body, headers };
  }

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

  // ================= Helper =================
  private applyHeadersToResponse(res: Response, headers?: Record<string, string | string[]>) {
    if (!headers) return;

    for (const [key, value] of Object.entries(headers)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (key.toLowerCase() === 'set-cookie') res.append('Set-Cookie', v);
          else res.append(key, v);
        });
      } else {
        if (key.toLowerCase() === 'set-cookie') res.append('Set-Cookie', value);
        else res.setHeader(key, value);
      }
    }
  }

  // ================= Auth-Service Routes =================
  @Get('auth/client-user/find-email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  async findEmail(@Query('email') email: string, @Headers('x-request-id') requestId: string, @Res({ passthrough: true }) res: Response) {
    CommonLoggerGateway.logStart('Gateway', 'FIND_EMAIL', email, requestId);
    const { headers, body } = await this.invokeAndHandle(
      '/production/auth/client-user/find-email',
      'GET',
      undefined,
      requestId,
      undefined,
      undefined,
      {
        email,
      },
    );
    this.applyHeadersToResponse(res, headers);
    return body;
  }

  @Post('auth/client-user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra um novo usuário' })
  async register(
    @Body() dto: RegisterClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'REGISTER', dto.email, requestId);
    const { headers, body } = await this.invokeAndHandle('/production/auth/client-user/register', 'POST', dto, requestId);
    this.applyHeadersToResponse(res, headers);
    return body;
  }

  @Post('auth/client-user/verify-account')
  @ApiOperation({ summary: 'Verifica o código de ativação da conta' })
  async verifyAccount(
    @Body() dto: VerifyAccountClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'VERIFY_ACCOUNT', dto.email, requestId);
    const { headers, body } = await this.invokeAndHandle('/production/auth/client-user/verify-account', 'POST', dto, requestId);
    this.applyHeadersToResponse(res, headers);
    return body;
  }

  @Post('auth/client-user/login')
  @ApiOperation({ summary: 'Login do usuário' })
  async login(@Body() dto: LoginClientUserDto, @Headers('x-request-id') requestId: string, @Res({ passthrough: true }) res: Response) {
    CommonLoggerGateway.logStart('Gateway', 'LOGIN', dto.email, requestId);
    const { headers, body } = await this.invokeAndHandle('/production/auth/client-user/login', 'POST', dto, requestId);
    this.applyHeadersToResponse(res, headers);
    return body;
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
    const { headers, body: responseBody } = await this.invokeAndHandle(
      '/production/auth/verify-password',
      'POST',
      body,
      requestId,
      undefined,
      cookie,
    );
    this.applyHeadersToResponse(res, headers);
    return responseBody;
  }

  @Post('auth/new-verification-code')
  @ApiOperation({ summary: 'Gera um novo código de verificação para o usuário' })
  async generateVerificationCode(
    @Body() body: { email: string },
    @Query('type') type: 'verify-account' | 'forgot-password',
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'GENERATE_VERIFICATION_CODE', `${body.email} | type: ${type}`, requestId);
    const payload = { ...body };
    const queryParams = { type };
    const { headers, body: responseBody } = await this.invokeAndHandle(
      '/production/auth/new-verification-code',
      'POST',
      payload,
      requestId,
      undefined,
      undefined,
      queryParams,
    );

    this.applyHeadersToResponse(res, headers);
    return responseBody;
  }

  @Post('auth/reset-password')
  @ApiOperation({ summary: 'Reseta a senha do usuário usando código de verificação' })
  async resetPassword(
    @Body() body: { email: string; verificationCode: string; newPassword: string },
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'RESET_PASSWORD', `Reset de senha solicitado para ${body.email}`, requestId);

    const payload = { ...body };

    const { headers, body: responseBody } = await this.invokeAndHandle(
      '/production/auth/reset-password',
      'POST',
      payload,
      requestId,
      undefined,
      undefined,
      undefined,
    );

    this.applyHeadersToResponse(res, headers);
    return responseBody;
  }

  @Post('auth/refresh-token')
  @ApiOperation({ summary: 'Gera um novo access token usando o refresh token' })
  async refreshToken(
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'REFRESH_TOKEN', 'N/A', requestId);
    const { headers, body } = await this.invokeAndHandle('/production/auth/refresh-token', 'POST', null, requestId, undefined, cookie);
    this.applyHeadersToResponse(res, headers);
    return body;
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
    const { headers, body } = await this.invokeAndHandle(
      '/production/auth/change-password',
      'PATCH',
      { password: dto.password, newPassword: dto.newPassword },
      requestId,
      undefined,
      cookie,
    );
    this.applyHeadersToResponse(res, headers);
    return body;
  }

  @Patch('auth/client-user/associate-clinical-info')
  async associateClinicalInfo(
    @Query('clinicalInfoId') clinicalInfoId: string,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'ASSOCIATE_CLINICAL_INFO', requestId);
    const { headers, body } = await this.invokeAndHandle(
      '/production/auth/client-user/associate-clinical-info',
      'PATCH',
      null,
      requestId,
      undefined,
      cookie,
      { clinicalInfoId },
    );
    this.applyHeadersToResponse(res, headers);
    return body;
  }

  @Patch('auth/client-user/change-name')
  async changeName(
    @Body() dto: ChangeNameClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'CHANGE_NAME', 'N/A', requestId);

    const { headers, body } = await this.invokeAndHandle(
      '/production/auth/client-user/change-name',
      'PATCH',
      { newFirstName: dto.newFirstName, newLastName: dto.newLastName },
      requestId,
      undefined,
      cookie,
    );

    this.applyHeadersToResponse(res, headers);
    return body;
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Encaminha logout para o auth-service' })
  async logout(@Headers('x-request-id') requestId: string, @Headers('cookie') cookie: string, @Res({ passthrough: true }) res: Response) {
    CommonLoggerGateway.logStart('Gateway', 'LOGOUT', 'N/A', requestId);
    const { headers, body } = await this.invokeAndHandle('/production/auth/logout', 'POST', null, requestId, undefined, cookie);
    this.applyHeadersToResponse(res, headers);

    return body;
  }

  @Delete('auth/client-user/delete-account')
  @HttpCode(204)
  async deleteAccount(
    @Body() dto: { password: string },
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'DELETE_ACCOUNT', 'N/A', requestId);

    const { headers, body } = await this.invokeAndHandle(
      '/production/auth/client-user/delete-account',
      'DELETE', // método HTTP
      { password: dto.password },
      requestId,
      undefined,
      cookie,
    );

    this.applyHeadersToResponse(res, headers);
    return body;
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
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'PUBLIC_DATA_ACCESS_ALERT', id, requestId);
    const queryParams = { id };
    const { headers, body } = await this.invokeAndHandle(
      '/production/auth/clinical-info-access-alert',
      'POST',
      undefined,
      requestId,
      undefined,
      undefined,
      queryParams,
    );

    this.applyHeadersToResponse(res, headers);
    return body;
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
    try {
      const { data, headers } = await this.handleDatabaseServiceCall(
        'get',
        `/public/clinical-info?id=${encodeURIComponent(id)}&code=${encodeURIComponent(code)}`,
        requestId,
        undefined,
        { code },
      );
      console.log(data);
      this.applyHeadersToResponse(res, headers);
      return data;
    } catch (err: any) {
      console.error('Erro capturado no controller:', err?.message || err);
      throw err;
    }
  }
}
