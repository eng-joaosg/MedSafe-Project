import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { findEmailClientUserUsecase } from 'src/application/usecases/client-user/find-email-client-user.usecase';
import { CommonLogger } from 'src/common/logger/common-logger';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Auth - Client User')
@Controller('auth/client-user/find-email')
export class ClientUserCheckEmailController {
  constructor(private readonly findEmailUsecase: findEmailClientUserUsecase) {}

  @Get()
  @ApiOperation({
    summary: 'Verifica se o e-mail do client user está disponível',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'E-mail a ser verificado',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidade do e-mail',
    schema: { example: { emailAlreadyExists: true } },
  })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findEmail(@Query('email') email: string) {
    CommonLogger.info('Auth', 'FIND_EMAIL', email);
    if (!email.includes('@')) {
      throw new BadRequestException('E-mail inválido');
    }
    const alreadyExists = await this.findEmailUsecase.execute(email);
    return { emailAlreadyExists: alreadyExists };
  }
}
