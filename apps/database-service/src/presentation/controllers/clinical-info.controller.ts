import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  Inject,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import type { IClinicalInfoService } from '../../application/contracts/i-clinical-info.service';
import { CLINICAL_INFO_SERVICE } from '../../common/contants/tokens.contants';
import { ClinicalInfoDto } from 'src/application/dtos/clinical-info.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('clinical-info')
@Controller('clinical-info')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(JwtAuthGuard)
export class ClinicalInfoController {
  constructor(
    @Inject(CLINICAL_INFO_SERVICE)
    private readonly clinicalInfoService: IClinicalInfoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Busca um registro de clinical info pelo ID.' })
  @ApiQuery({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: ClinicalInfoDto })
  async getById(@Query('id', ParseUUIDPipe) id: string): Promise<ClinicalInfoDto> {
    return await this.clinicalInfoService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo registro de clinical info.' })
  @ApiBody({ type: ClinicalInfoDto, description: 'Payload completo.' })
  @ApiResponse({ status: 201, description: 'Criado com sucesso', type: ClinicalInfoDto })
  async create(@Body() payload: ClinicalInfoDto): Promise<ClinicalInfoDto> {
    console.log('===========inicio');
    const res = await this.clinicalInfoService.create(payload);
    console.log(res);
    console.log('=============FIM');
    return res;
  }

  @Put()
  @ApiOperation({ summary: 'Atualiza parcialmente um registro de clinical info.' })
  @ApiQuery({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Atualizado com sucesso', type: ClinicalInfoDto })
  async put(@Query('id', ParseUUIDPipe) id: string, @Body() partial: Partial<ClinicalInfoDto>): Promise<ClinicalInfoDto> {
    return await this.clinicalInfoService.save(partial, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um registro de clinical info pelo ID.' })
  @ApiQuery({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 204, description: 'Deletado com sucesso.' })
  async delete(@Query('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.clinicalInfoService.deleteById(id);
  }

  @Get('all')
  @ApiOperation({ summary: 'Retorna todas as listas de clinical info (cirurgias, doenças, medicamentos, alergias).' })
  @ApiResponse({
    status: 200,
    description: 'Listas retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        surgeries: { type: 'array', items: { type: 'string' } },
        diseases: { type: 'array', items: { type: 'string' } },
        medications: { type: 'array', items: { type: 'string' } },
        allergies: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getAllClinicalInfo(): Promise<{
    surgeries: string[];
    diseases: string[];
    medications: string[];
    allergies: string[];
  }> {
    return await this.clinicalInfoService.getAllClinicalInfo();
  }
}
