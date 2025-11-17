import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common';
import { ApiKeyGuardForAuthService } from '../guards/api-key-for-auth-service.guard';
import { ClientUserService } from 'src/application/services/client-user.service';
import { ClientUserModel } from 'src/application/models/client-user.model';
import { UserNotFoundException } from 'src/common/exceptions/app.exceptions';

@ApiTags('client-user/auth')
@Controller('client-user/auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(ApiKeyGuardForAuthService)
export class ClientUserAuthController {
  constructor(private readonly patientAuthService: ClientUserService) {}

  @Get('find-email/:email')
  @ApiOperation({ summary: 'Verifica se um email está cadastrado (retorna true/false).' })
  @ApiResponse({
    status: 200,
    description: 'Retorna true se o email já está cadastrado, false se pode ser usado.',
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async findByEmail(@Param('email') email: string): Promise<boolean> {
    return await this.patientAuthService.findEmail(email);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo usuário cliente.' })
  @ApiBody({ type: ClientUserModel, description: 'Payload para criação de um novo paciente.' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso.', type: ClientUserModel })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async createClientUser(@Body() payload: ClientUserModel): Promise<ClientUserModel> {
    return this.patientAuthService.save(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário cliente existente pelo ID.' })
  @ApiBody({
    type: ClientUserModel,
    description: 'Payload para atualização de um paciente existente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro atualizado com sucesso.',
    type: ClientUserModel,
  })
  @ApiResponse({
    status: 400,
    description: 'ID da URL difere do corpo da requisição ou payload inválido.',
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async updateClientUser(@Param('id', ParseUUIDPipe) id: string, @Body() payload: ClientUserModel): Promise<ClientUserModel> {
    if (id !== payload.id) {
      throw new BadRequestException('O ID na URL deve ser igual ao ID do corpo da requisição.');
    }
    return this.patientAuthService.save(payload);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário cliente pelo ID.' })
  @ApiResponse({
    status: 200,
    description: 'Dados do paciente encontrados.',
    type: ClientUserModel,
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async findClientUserById(@Param('id', ParseUUIDPipe) id: string): Promise<ClientUserModel> {
    const user = await this.patientAuthService.getById(id);
    if (!user) {
      throw new UserNotFoundException(`ClientUser com ID ${id} não encontrado.`);
    }
    return user;
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Busca um usuário cliente pelo email.' })
  @ApiResponse({
    status: 200,
    description: 'Dados do paciente encontrados.',
    type: ClientUserModel,
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async findClientUserByEmail(@Param('email') email: string): Promise<ClientUserModel> {
    const user = await this.patientAuthService.getByEmail(email);
    if (!user) {
      throw new UserNotFoundException(`ClientUser com email ${email} não encontrado.`);
    }
    return user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um usuário cliente pelo ID.' })
  @ApiResponse({ status: 200, description: 'Paciente deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async deleteClientUserAuth(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const user = await this.patientAuthService.getById(id);
    if (!user) {
      throw new UserNotFoundException(`ClientUser com ID ${id} não encontrado.`);
    }
    await this.patientAuthService.deleteById(id);
  }
}
