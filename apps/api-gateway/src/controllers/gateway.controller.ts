import { Controller, Get, Param, Headers, UseGuards, Post, Body, HttpCode, HttpStatus, HttpException, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map, Observable } from 'rxjs';
import { ServicesConfig } from './service-config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommonLoggerGateway } from 'src/common/common.logger';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterClientUserDto } from 'src/dtos/register-client-user.dto';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(
    private readonly httpService: HttpService,
    private readonly servicesConfig: ServicesConfig,
  ) {}

  private getAuthHeaders(service: string, requestId: string) {
    const headers: Record<string, string> = {};
    if (service === 'AUTH_SERVICE') {
      headers['x-api-key'] = this.servicesConfig.authServiceApiKey;
    }
    headers['x-request-id'] = requestId;
    return headers;
  }

  // -----------------------
  // Rotas públicas
  // -----------------------
  @Get('client-user/find-email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  @ApiResponse({ status: 200, description: 'true = e-mail existe, false = não existe', type: Boolean })
  @ApiResponse({ status: 400, description: 'Email não fornecido' })
  @ApiResponse({ status: 500, description: 'Erro interno' })
  async findEmail(@Query('email') email: string, @Headers('x-request-id') requestId: string): Promise<boolean> {
    if (!email) throw new HttpException('Email não fornecido', HttpStatus.BAD_REQUEST);
    CommonLoggerGateway.logStart('Gateway', 'FIND_EMAIL', email, requestId);
    const observable$: Observable<{ emailAlreadyExists: boolean }> = this.httpService
      .get(`${this.servicesConfig.authServiceUrl}/client-user/find-email`, {
        headers: this.getAuthHeaders('AUTH_SERVICE', requestId),
        params: { email },
      })
      .pipe(map((res) => res.data));

    const response = await lastValueFrom(observable$);
    return response.emailAlreadyExists;
  }

  @Post('client-user/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterClientUserDto, @Headers('x-request-id') requestId: string) {
    CommonLoggerGateway.logStart('Gateway', 'REGISTER', dto.email, requestId);
    try {
      await lastValueFrom(
        this.httpService
          .post(`${this.servicesConfig.authServiceUrl}/client-user/register`, dto, {
            headers: this.getAuthHeaders('AUTH_SERVICE', requestId),
          })
          .pipe(map((res) => res.data)),
      );
      return;
    } catch (err: any) {
      if (err.response?.status === 409) {
        throw new HttpException('E-mail já está em uso', HttpStatus.CONFLICT);
      } else if (err.response?.status === 400) {
        throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Erro interno do servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
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
  async getUserById(@Param('id') id: string, @Headers('x-request-id') requestId: string): Promise<string> {
    CommonLoggerGateway.logStart('Gateway', 'GET_USER', id, requestId);

    const observable$: Observable<string> = this.httpService
      .get(`${this.servicesConfig.authServiceUrl}/client-user/${id}`, {
        headers: this.getAuthHeaders('AUTH_SERVICE', requestId),
      })
      .pipe(map((res) => res.data));

    return await lastValueFrom(observable$);
  }
}
