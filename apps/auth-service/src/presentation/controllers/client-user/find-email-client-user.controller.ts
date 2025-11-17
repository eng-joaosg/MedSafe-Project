import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FindEmailClientUserUsecase } from 'src/application/usecases/client-user/find-email-client-user.usecase';
import { CommonLogger } from 'src/common/logger/common.logger';
import { RequestContextService } from 'src/common/request-context/request-context.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth - Client User')
@Controller('auth/client-user/find-email')
export class FindEmailClientUserController {
  constructor(
    private readonly findEmailUsecase: FindEmailClientUserUsecase,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Verifica se o e-mail do client user está disponível',
    description: 'Retorna se o e-mail já está cadastrado no sistema. Se o e-mail não for válido, retorna 400.',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'E-mail a ser verificado',
    example: 'usuario@dominio.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorno da verificação do e-mail',
    schema: {
      example: {
        emailAlreadyExists: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'E-mail inválido' })
  @ApiResponse({ status: 500, description: 'Erro interno no servidor' })
  async findEmail(@Query('email') email: string) {
    CommonLogger.info('Auth', 'FIND_EMAIL', email);

    if (!email || !email.includes('@')) {
      throw new BadRequestException('E-mail inválido');
    }

    const alreadyExists = await this.findEmailUsecase.execute(email);

    return {
      emailAlreadyExists: alreadyExists,
    };
  }
}
