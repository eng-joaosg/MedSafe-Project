import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Delete,
  UseGuards,
  Query,
  Inject,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiKeyGuardForAuthService } from '../guards/api-key-for-auth-service.guard';
import { ClientUserModel } from '../../application/models/client-user.model';
import type { IClientUserService } from '../../application/contracts/i-client-user.service';
import { CLIENT_USER_SERVICE } from '../../common/contants/tokens.contants';

@ApiTags('client-user')
@Controller('client-user')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(ApiKeyGuardForAuthService)
export class ClientUserAuthController {
  constructor(
    @Inject(CLIENT_USER_SERVICE)
    private readonly clientUserService: IClientUserService,
  ) {}

  @Get('find-email')
  @ApiOperation({ summary: 'Verifica se um email está cadastrado (retorna true/false).' })
  @ApiQuery({ name: 'email', required: true })
  @ApiResponse({ status: 200, description: 'true se o email existe, false caso contrário.' })
  async findByEmail(@Query('email') email: string): Promise<boolean> {
    return await this.clientUserService.findEmail(email);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um usuário cliente.' })
  @ApiQuery({ name: 'id', required: true, description: 'ID do usuário para criação.' })
  @ApiBody({ type: ClientUserModel, description: 'Payload completo.' })
  @ApiResponse({ status: 201, description: 'Criado com sucesso.', type: ClientUserModel })
  async createClientUser(@Query('id') id: string, @Body() payload: ClientUserModel): Promise<ClientUserModel> {
    return this.clientUserService.save(id, payload);
  }

  @Get('by-id')
  @ApiOperation({ summary: 'Busca um usuário cliente pelo ID.' })
  @ApiQuery({ name: 'id', required: true })
  @ApiResponse({ status: 200, type: ClientUserModel })
  async findClientUserById(@Query('id', ParseUUIDPipe) id: string): Promise<ClientUserModel> {
    return await this.clientUserService.getById(id);
  }

  @Get('by-clinical-info-id')
  @ApiOperation({ summary: 'Busca um usuário cliente pelo ID do clinical info.' })
  @ApiQuery({ name: 'id', required: true })
  @ApiResponse({ status: 200, type: ClientUserModel })
  async findClientUserByClinicalInfoId(@Query('id', ParseUUIDPipe) id: string): Promise<ClientUserModel> {
    return await this.clientUserService.getByClinicalInfoId(id);
  }

  @Get('by-email')
  @ApiOperation({ summary: 'Busca um usuário cliente pelo email.' })
  @ApiQuery({ name: 'email', required: true })
  @ApiResponse({ status: 200, type: ClientUserModel })
  async findClientUserByEmail(@Query('email') email: string): Promise<ClientUserModel> {
    return await this.clientUserService.getByEmail(email);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um usuário cliente pelo ID.' })
  @ApiQuery({ name: 'id', required: true })
  @ApiResponse({ status: 204, description: 'Paciente deletado com sucesso.' })
  async deleteClientUser(@Query('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.clientUserService.deleteById(id);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualiza parcialmente um usuário cliente.' })
  @ApiQuery({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.', type: ClientUserModel })
  async saveClientUser(@Query('id', ParseUUIDPipe) id: string, @Body() partial: Partial<ClientUserModel>): Promise<ClientUserModel> {
    return await this.clientUserService.save(id, partial);
  }
}
