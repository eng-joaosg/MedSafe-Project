import {
  Controller,
  Get,
  Param,
  Headers,
  UseGuards,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ServicesConfig } from '../services/service-config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommonLoggerGateway } from '../common/common.logger';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterClientUserDto } from '../dtos/register-client-user.dto';
import { VerifyAccountClientUserDto } from '../dtos/verify-client-user.dto';
import { AuthServiceInvoker } from '../services/auth-service.invoker';
import {
  InvalidCredentialsException,
  InvalidVerificationCodeException,
  UserAlreadyExistsException,
  UserNotActiveException,
  UserNotFoundException,
  VerificationCodeExpiredException,
} from '../common/app.exceptions';
import { LoginClientUserDto } from 'src/dtos/login-client-user.dto';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(
    private readonly invoker: AuthServiceInvoker,
    private readonly servicesConfig: ServicesConfig,
  ) {}

  // -----------------------
  // Rotas públicas
  // -----------------------

  @Get('client-user/find-email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  @ApiResponse({
    status: 200,
    description: 'emailAlreadyExists = true ou false',
    schema: {
      type: 'object',
      properties: {
        emailAlreadyExists: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email não fornecido ou inválido.' })
  async findEmail(@Query('email') email: string, @Headers('x-request-id') requestId: string): Promise<{ emailAlreadyExists: boolean }> {
    if (!email) {
      throw new HttpException('Email não fornecido ou inválido.', HttpStatus.BAD_REQUEST);
    }

    CommonLoggerGateway.logStart('Gateway', 'FIND_EMAIL', email, requestId);

    const { statusCode, body } = await this.invoker.invoke<boolean>('findEmailClientUser', { email }, requestId);

    if (statusCode !== 200) {
      throw new InternalServerErrorException('Erro no servidor');
    }
    console.log(body);
    return { emailAlreadyExists: Boolean((body as any).emailAlreadyExists) };
  }

  @Post('client-user/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiBody({ type: RegisterClientUserDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso' })
  async register(@Body() dto: RegisterClientUserDto, @Headers('x-request-id') requestId: string): Promise<void> {
    CommonLoggerGateway.logStart('Gateway', 'REGISTER', dto.email, requestId);

    const { statusCode } = await this.invoker.invoke<unknown>('registerClientUser', dto, requestId);

    if (statusCode === 409) {
      throw new UserAlreadyExistsException('E-mail já está em uso');
    }
    if (statusCode !== 201 && statusCode !== 200) {
      throw new InternalServerErrorException('Erro no servidor');
    }
    return;
  }

  @Post('client-user/verify-account')
  @ApiOperation({ summary: 'Verifica o código de ativação da conta' })
  @ApiBody({ type: VerifyAccountClientUserDto })
  @ApiResponse({ status: 200, description: 'Conta verificada com sucesso' })
  @ApiResponse({ status: 400, description: 'E-mail ou código inválido' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 409, description: 'Código incorreto ou expirado' })
  async verifyAccount(@Body() dto: VerifyAccountClientUserDto, @Headers('x-request-id') requestId: string): Promise<void> {
    CommonLoggerGateway.logStart('Gateway', 'VERIFY_ACCOUNT', dto.email, requestId);

    const { statusCode } = await this.invoker.invoke<unknown>('verifyAccountClientUser', dto, requestId);
    if (statusCode === 400) {
      throw new BadRequestException('Código inválido');
    }
    if (statusCode === 401) {
      throw new InvalidVerificationCodeException();
    }
    if (statusCode === 403) {
      throw new VerificationCodeExpiredException();
    }
    if (statusCode === 404) {
      throw new UserNotFoundException();
    }
    if (statusCode !== 200) {
      throw new InternalServerErrorException('Erro no servidor, tente novamente mais tarde.');
    }
    return;
  }

  @Post('client-user/login')
  @ApiOperation({ summary: 'Realiza login do usuário' })
  @ApiBody({ type: LoginClientUserDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha incorretos' })
  @ApiResponse({ status: 403, description: 'Conta não verificada' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno no servidor' })
  async login(@Body() dto: LoginClientUserDto, @Headers('x-request-id') requestId: string): Promise<void> {
    CommonLoggerGateway.logStart('Gateway', 'LOGIN', dto.email, requestId);

    const { statusCode } = await this.invoker.invoke<unknown>('loginClientUser', dto, requestId);
    if (statusCode === 400) {
      throw new BadRequestException('Credenciais inválidas.');
    }
    if (statusCode === 401) {
      throw new InvalidCredentialsException();
    }
    if (statusCode === 403) {
      throw new UserNotActiveException();
    }
    if (statusCode === 404) {
      throw new UserNotFoundException();
    }
    if (statusCode !== 200) {
      throw new InternalServerErrorException('Erro no servidor, tente novamente mais tarde.');
    }

    return;
  }

  // -----------------------
  // Rotas protegidas
  // -----------------------

  @UseGuards(JwtAuthGuard)
  @Get('client-user/:id')
  @ApiOperation({ summary: 'Retorna um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserById(@Param('id') id: string, @Headers('x-request-id') requestId: string): Promise<void> {
    CommonLoggerGateway.logStart('Gateway', 'GET_USER', id, requestId);

    const { statusCode, body } = await this.invoker.invoke<void>('getClientUserById', { id }, requestId);

    if (statusCode === 404) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return body;
  }
}
