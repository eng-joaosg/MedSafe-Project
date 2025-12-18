import { Controller, Get, Query, BadRequestException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiHeader } from '@nestjs/swagger';
import type { IClinicalInfoService } from '../../application/contracts/i-clinical-info.service';
import { CLINICAL_INFO_SERVICE } from '../../common/contants/tokens.contants';
import { ClinicalInfoDto } from '../../application/dtos/clinical-info.dto';

@ApiTags('public')
@Controller('public')
export class PublicClinicalInfoController {
  constructor(
    @Inject(CLINICAL_INFO_SERVICE)
    private readonly clinicalInfoService: IClinicalInfoService,
  ) {}

  @Get('clinical-info')
  @ApiOperation({
    summary: 'Busca informações clínicas públicas usando publicCode e ID. ' + 'Endpoint público, exposto exclusivamente via API Gateway.',
  })
  @ApiQuery({
    name: 'id',
    description: 'UUID do registro clínico',
    required: true,
  })
  @ApiQuery({
    name: 'code',
    description: 'Código público de acesso (máx. 6 caracteres)',
    required: true,
  })
  @ApiHeader({
    name: 'x-api-key',
    required: false,
    description: 'API Key usada pelo API Gateway (não obrigatória para uso direto do Nest).',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações clínicas públicas',
    type: ClinicalInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos',
  })
  async getPublicData(@Query('id') id: string, @Query('code') code: string): Promise<ClinicalInfoDto> {
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      throw new BadRequestException('O ID deve ser um UUID válido.');
    }

    if (!code || code.length > 6) {
      throw new BadRequestException('O código deve ter no máximo 6 caracteres.');
    }

    const data = await this.clinicalInfoService.getByPublicCode(id, code);

    data.contacts = data.contacts?.map((c, index) => ({
      id: index + 1,
      firstName: c?.firstName ?? undefined,
      lastName: c?.lastName ?? undefined,
      ddd: c?.ddd ?? undefined,
      phone: c?.phone ?? undefined,
      relationship: c?.relationship ?? '',
    }));

    return data;
  }
}
