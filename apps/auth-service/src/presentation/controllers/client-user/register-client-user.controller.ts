import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RegisterClientUserDto } from 'src/application/dtos/client-user/register-client-user.dto';
import { RegisterClientUserUsecase } from 'src/application/usecases/client-user/register-client-user.usecase';

import { CommonLogger } from 'src/common/logger/common.logger';

@ApiTags('Auth - Client User')
@Controller('register/client-user')
export class RegisterClientUserController {
  constructor(private readonly registerClientUserUseCase: RegisterClientUserUsecase) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Registra um novo client user',
    description: 'Cria uma nova conta de cliente. Retorna 204 em caso de sucesso.',
  })
  @ApiResponse({
    status: 204,
    description: 'Usuário criado com sucesso. Nenhum conteúdo é retornado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (ex.: e-mail ou senha inválidos).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito — e-mail já registrado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno no servidor.',
  })
  async handle(@Body() dto: RegisterClientUserDto): Promise<void> {
    CommonLogger.info('Auth', 'REGISTER_CLIENT_USER_START', {
      email: dto.email,
    });

    await this.registerClientUserUseCase.execute(dto);
  }
}
