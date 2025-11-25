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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthServiceInvoker, GatewayResponse } from '../services/auth-service.invoker';
import { RegisterClientUserDto } from '../dtos/register-client-user.dto';
import { VerifyAccountClientUserDto } from '../dtos/verify-client-user.dto';
import { LoginClientUserDto } from '../dtos/login-client-user.dto';
import { SessionClientUserDto } from '../dtos/session-client-user.dto';
import { ChangePasswordClientUserDto } from '../dtos/change-password-client-user.dto';
import type { Response } from 'express';
import { CommonLoggerGateway } from '../common/common.logger';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly invoker: AuthServiceInvoker) {}

  // Helper para invocar serviço e tratar erros
  private async invokeAndHandle<T>(
    path: string,
    method: 'GET' | 'POST' | 'PATCH',
    payload: any,
    requestId: string,
    authorization?: string,
  ): Promise<GatewayResponse<T>> {
    const { statusCode, body } = await this.invoker.invoke<T>(path, method, payload, requestId, authorization);

    if (statusCode >= 400 && statusCode < 500) throw new BadRequestException('Erro de requisição');
    if (statusCode >= 500) throw new InternalServerErrorException('Erro no servidor');

    return { statusCode, body };
  }

  @Get('client-user/find-email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  @ApiResponse({
    status: 200,
    description: 'emailAlreadyExists = true ou false',
    schema: { type: 'object', properties: { emailAlreadyExists: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 400, description: 'Email não fornecido ou inválido.' })
  async findEmail(@Query('email') email: string, @Headers('x-request-id') requestId: string) {
    if (!email) throw new BadRequestException('Email não fornecido ou inválido.');

    CommonLoggerGateway.logStart('Gateway', 'FIND_EMAIL', email, requestId);

    const { body } = await this.invokeAndHandle<{ emailAlreadyExists: boolean }>('/client-user/find-email', 'GET', { email }, requestId);

    return { emailAlreadyExists: Boolean(body.emailAlreadyExists) };
  }

  @Post('client-user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiBody({ type: RegisterClientUserDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  async register(@Body() dto: RegisterClientUserDto, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'REGISTER', dto.email, requestId);

    await this.invokeAndHandle('/client-user/register', 'POST', dto, requestId);
  }

  @Post('client-user/verify-account')
  @ApiOperation({ summary: 'Verifica o código de ativação da conta' })
  @ApiBody({ type: VerifyAccountClientUserDto })
  @ApiResponse({ status: 200, description: 'Conta verificada com sucesso' })
  async verifyAccount(@Body() dto: VerifyAccountClientUserDto, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'VERIFY_ACCOUNT', dto.email, requestId);

    await this.invokeAndHandle('/client-user/verify-account', 'POST', dto, requestId);
  }

  @Post('client-user/login')
  @ApiOperation({ summary: 'Login do usuário' })
  async login(@Body() dto: LoginClientUserDto, @Headers('x-request-id') requestId: string, @Res({ passthrough: true }) res: Response) {
    CommonLoggerGateway.logStart('Gateway', 'LOGIN', dto.email, requestId);

    const { body } = await this.invokeAndHandle<SessionClientUserDto>('/client-user/login', 'POST', dto, requestId);

    res.cookie('jwt', body.accessToken.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: body.accessToken.expiresIn ? body.accessToken.expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    return { firstName: body.firstName, id: body.id };
  }

  @Patch('client-user/change-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Atualiza a senha do usuário' })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  async changePassword(@Body() dto: ChangePasswordClientUserDto, @Headers('x-request-id') requestId: string) {
    if (!dto.newPassword) throw new BadRequestException('Nova senha não fornecida');

    CommonLoggerGateway.logStart('Gateway', 'CHANGE_PASSWORD', 'N/A', requestId);

    await this.invokeAndHandle('/client-user/change-password', 'PATCH', { newPassword: dto.newPassword }, requestId);
  }
}
