import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ServicesConfig } from './service-config';
import { JwtAuthGuard, Public } from 'src/auth/jwt-auth.guard';
import { CommonLogger } from 'src/common/common-logger';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

interface UserDto {
  id: string;
  name: string;
  email: string;
}

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(
    private readonly httpService: HttpService,
    private readonly servicesConfig: ServicesConfig,
  ) {}

  private getAuthHeaders() {
    return { 'x-api-key': this.servicesConfig.authServiceApiKey };
  }

  // -----------------------------
  // Rotas protegidas
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  @ApiOperation({ summary: 'Retorna um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: String })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const start = CommonLogger.logStart('Gateway', 'GET_USER', id);

    const response = await lastValueFrom(
      this.httpService.get<UserDto>(`${this.servicesConfig.authServiceUrl}/users/${id}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    CommonLogger.logSuccess('Gateway', 'GET_USER', id, start);
    return response.data;
  }

  // -----------------------------
  // Rotas públicas
  // -----------------------------
  @Public()
  @Get('check-email/:email')
  @ApiOperation({ summary: 'Verifica se o e-mail já está cadastrado' })
  @ApiParam({ name: 'email', description: 'E-mail a ser verificado', type: String })
  @ApiResponse({ status: 200, description: 'true se o e-mail existe, false se não', type: Boolean })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async checkEmail(@Param('email') email: string): Promise<boolean> {
    const start = CommonLogger.logStart('Gateway', 'CHECK_EMAIL', email);

    const response = await lastValueFrom(
      this.httpService.get<boolean>(`${this.servicesConfig.authServiceUrl}/check-email/${email}`, {
        headers: this.getAuthHeaders(),
      }),
    );

    CommonLogger.logSuccess('Gateway', 'CHECK_EMAIL', email, start);
    return response.data;
  }
}
