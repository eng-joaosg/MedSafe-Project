import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthServiceInvoker, GatewayResponse } from '../services/auth-service.invoker';
import { RegisterClientUserDto } from '../dtos/register-client-user.dto';
import { VerifyAccountClientUserDto } from '../dtos/verify-client-user.dto';
import { LoginClientUserDto } from '../dtos/login-client-user.dto';
import { SessionClientUserDto } from '../dtos/session-client-user.dto';
import { ChangePasswordClientUserDto } from '../dtos/change-password-client-user.dto';
import type { Response } from 'express';
import { CommonLoggerGateway } from '../common/common.logger';
import { ChangeNameClientUserDto } from 'src/dtos/change-name-client-user.dto';
import axios from 'axios';
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  Res,
  Delete,
  Put,
} from '@nestjs/common';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly invoker: AuthServiceInvoker) {}
  private databaseServiceUrl = 'http://localhost:3004';

  // ======== Helpers ========
  private extractAuthToken(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
  }

  private async invokeAndHandle<T>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT',
    payload: any,
    requestId: string,
    authToken?: string,
    cookieHeader?: string,
    queryParams?: Record<string, string | number | boolean>,
  ): Promise<GatewayResponse<T>> {
    console.log(method);
    const { statusCode, body } = await this.invoker.invoke<T>(path, method, payload, requestId, authToken, cookieHeader, queryParams);

    if (statusCode >= 400 && statusCode < 500) throw new BadRequestException('Erro de requisição');
    if (statusCode >= 500) throw new InternalServerErrorException('Erro no servidor');

    return { statusCode, body };
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
      const headers: Record<string, string> = {
        'x-request-id': requestId,
      };

      if (cookieHeader) {
        headers['cookie'] = cookieHeader;
      }

      let response;
      if (method === 'get' || method === 'delete') {
        response = await axios[method](url, { headers });
      } else {
        response = await axios[method](url, payload, { headers });
      }

      // Retorna o JSON puro do EC2, sem statusCode/body envelopado
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data; // JSON direto
      }
      return { message: error.message };
    }
  }

  // ================= Auth-Service Routes =================
  @Get('client-user/find-email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  @ApiResponse({
    status: 200,
    description: 'emailAlreadyExists = true ou false',
    schema: { type: 'object', properties: { emailAlreadyExists: { type: 'boolean' } } },
  })
  async findEmail(@Query('email') email: string, @Headers('x-request-id') requestId: string) {
    if (!email) throw new BadRequestException('Email não fornecido ou inválido.');

    CommonLoggerGateway.logStart('Gateway', 'FIND_EMAIL', email, requestId);

    const { body } = await this.invokeAndHandle<{ emailAlreadyExists: boolean }>(
      '/client-user/find-email',
      'GET',
      undefined, // payload undefined para GET
      requestId,
      undefined, // sem auth
      undefined, // sem cookie
      { email },
    );

    return { emailAlreadyExists: Boolean(body.emailAlreadyExists) };
  }

  @Post('client-user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiBody({ type: RegisterClientUserDto })
  async register(@Body() dto: RegisterClientUserDto, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'REGISTER', dto.email, requestId);
    await this.invokeAndHandle('/client-user/register', 'POST', dto, requestId);
  }

  @Post('client-user/verify-account')
  @ApiOperation({ summary: 'Verifica o código de ativação da conta' })
  @ApiBody({ type: VerifyAccountClientUserDto })
  async verifyAccount(@Body() dto: VerifyAccountClientUserDto, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'VERIFY_ACCOUNT', dto.email, requestId);
    await this.invokeAndHandle('/client-user/verify-account', 'POST', dto, requestId);
  }

  @Post('client-user/login')
  @ApiOperation({ summary: 'Login do usuário' })
  async login(
    @Body() dto: LoginClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    CommonLoggerGateway.logStart('Gateway', 'LOGIN', dto.email, requestId);
    const { body } = await this.invokeAndHandle<SessionClientUserDto>('/client-user/login', 'POST', dto, requestId, undefined, cookie);

    res.cookie('auth_token', body.accessToken.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: body.accessToken.expiresIn ? body.accessToken.expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    return {
      firstName: body.firstName,
      lastName: body.lastName,
      id: body.id,
      clinicalInfo: body.clinicalInfoId,
    };
  }

  @Patch('client-user/change-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Atualiza a senha do usuário' })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  async changePassword(
    @Body() dto: ChangePasswordClientUserDto,
    @Headers('x-request-id') requestId: string,
    @Headers('cookie') cookie: string,
  ) {
    if (!dto.newPassword) throw new BadRequestException('Nova senha não fornecida');
    CommonLoggerGateway.logStart('Gateway', 'CHANGE_PASSWORD', 'N/A', requestId);
    await this.invokeAndHandle(
      '/client-user/change-password',
      'PATCH',
      { newPassword: dto.newPassword },
      requestId,
      this.extractAuthToken(cookie) ? `Bearer ${this.extractAuthToken(cookie)}` : '',
      cookie,
    );
  }

  @Patch('client-user/associate-clinical-info')
  @ApiOperation({ summary: 'Associa informações clínicas ao usuário logado' })
  async associateClinicalInfo(
    @Query('clinicalInfoId') clinicalInfoId: string,
    @Headers('cookie') cookie: string,
    @Headers('authorization') authorization: string,
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!clinicalInfoId) {
      throw new BadRequestException('ID das informações clínicas não informado');
    }
    console.log('clinical info id:', clinicalInfoId);
    CommonLoggerGateway.logStart('Gateway', 'ASSOCIATE_CLINICAL_INFO', requestId);
    const authToken =
      (authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : null) || (cookie ? this.extractAuthToken(cookie) : null);
    const { body } = await this.invokeAndHandle<SessionClientUserDto>(
      '/client-user/associate-clinical-info',
      'PATCH',
      null,
      requestId,
      authToken ? `Bearer ${authToken}` : undefined,
      cookie,
      { clinicalInfoId },
    );
    if (body.accessToken?.accessToken) {
      res.cookie('auth_token', body.accessToken.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: body.accessToken.expiresIn ? body.accessToken.expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      firstName: body.firstName,
      lastName: body.lastName,
      id: body.id,
      clinicalInfo: body.clinicalInfoId,
    };
  }

  @Patch('client-user/change-name')
  @ApiOperation({ summary: 'Atualiza o nome do usuário' })
  async changeName(
    @Query('id') clientUserId: string,
    @Body() dto: ChangeNameClientUserDto,
    @Headers('cookie') cookie: string,
    @Headers('x-request-id') requestId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!clientUserId) throw new BadRequestException('ID do usuário não fornecido');
    if (!dto.newFirstName || !dto.newLastName) throw new BadRequestException('Novo nome não fornecido');

    CommonLoggerGateway.logStart('Gateway', 'CHANGE_NAME', clientUserId, requestId);
    const authToken = this.extractAuthToken(cookie) ? `Bearer ${this.extractAuthToken(cookie)}` : '';
    const { body } = await this.invokeAndHandle<SessionClientUserDto>(
      '/client-user/change-name',
      'PATCH',
      { newFirstName: dto.newFirstName, newLastName: dto.newLastName },
      requestId,
      authToken,
      cookie,
    );

    res.cookie('auth_token', body.accessToken.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: body.accessToken.expiresIn ? body.accessToken.expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    return { firstName: body.firstName, lastName: body.lastName, id: body.id, clinicalInfo: body.clinicalInfoId };
  }

  // ================= Database-Service Routes =================
  @Get('clinical-info/all')
  async getAllClinicalInfo(@Headers('cookie') cookie: string, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'GET_ALL_CLINICAL_INFO', 'N/A', requestId);
    return this.handleDatabaseServiceCall('get', '/clinical-info/all', requestId, cookie);
  }

  @Get('clinical-info')
  async getClinicalInfo(@Query('id') clientUserId: string, @Headers('cookie') cookie: string, requestId: string) {
    if (!clientUserId) throw new BadRequestException('ID do usuário não fornecido');
    CommonLoggerGateway.logStart('Gateway', 'GET_CLINICAL_INFO', clientUserId, requestId);
    return this.handleDatabaseServiceCall('get', `/clinical-info?id=${encodeURIComponent(clientUserId)}`, requestId, cookie);
  }

  @Post('clinical-info')
  async createClinicalInfo(@Body() payload: any, @Headers('cookie') cookie: string, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'CREATE_CLINICAL_INFO', 'N/A', requestId);
    return this.handleDatabaseServiceCall('post', `/clinical-info`, requestId, cookie, payload);
  }

  @Put('clinical-info')
  async putClinicalInfo(
    @Query('id') clinicalInfoId: string,
    @Body() partial: any,
    @Headers('cookie') cookie: string,
    @Headers('x-request-id') requestId: string,
  ) {
    if (!clinicalInfoId) {
      throw new BadRequestException('ID das informações clínicas não fornecido');
    }

    CommonLoggerGateway.logStart('Gateway', 'PUT_CLINICAL_INFO', clinicalInfoId, requestId);

    return this.handleDatabaseServiceCall('put', `/clinical-info?id=${encodeURIComponent(clinicalInfoId)}`, requestId, cookie, partial);
  }

  @Delete('clinical-info')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClinicalInfo(
    @Query('id') clientUserId: string,
    @Headers('cookie') cookie: string,
    @Headers('x-request-id') requestId: string,
  ) {
    if (!clientUserId) throw new BadRequestException('ID do usuário não fornecido');
    CommonLoggerGateway.logStart('Gateway', 'DELETE_CLINICAL_INFO', clientUserId, requestId);
    return this.handleDatabaseServiceCall('delete', `/clinical-info?id=${encodeURIComponent(clientUserId)}`, requestId, cookie);
  }
}
