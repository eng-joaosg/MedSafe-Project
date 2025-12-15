import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Inject,
  UseGuards,
  Put,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation, ApiBody, ApiSecurity } from '@nestjs/swagger';
import type { IClinicalInfoService } from '../../application/contracts/i-clinical-info.service';
import { CLINICAL_INFO_SERVICE } from '../../common/contants/tokens.contants';
import { ClinicalInfoDto } from 'src/application/dtos/clinical-info.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@ApiTags('clinical-info')
@ApiSecurity('jwt')
@Controller('clinical-info')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(JwtAuthGuard)
export class ClinicalInfoController {
  constructor(
    @Inject(CLINICAL_INFO_SERVICE)
    private readonly clinicalInfoService: IClinicalInfoService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Busca o clinical info usando o clinicalInfoId do JWT.' })
  @ApiResponse({ status: 200, type: ClinicalInfoDto })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado ou token inválido.' })
  async getByToken(@Req() req: Request): Promise<ClinicalInfoDto> {
    const clinicalInfoId: string | undefined = (req as any).user?.clinicalInfo;

    if (!clinicalInfoId) {
      throw new BadRequestException('Token não contém clinicalInfoId');
    }

    return await this.clinicalInfoService.getById(clinicalInfoId);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Retorna todas as listas (cirurgias, doenças, medicamentos, alergias).',
  })
  @ApiResponse({
    status: 200,
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
  @ApiResponse({ status: 401, description: 'Usuário não autenticado ou token inválido.' })
  async getAllClinicalInfo(): Promise<{
    surgeries: string[];
    diseases: string[];
    medications: string[];
    allergies: string[];
  }> {
    return await this.clinicalInfoService.getAllClinicalInfo();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo registro de clinical info.' })
  @ApiBody({ type: ClinicalInfoDto })
  @ApiResponse({ status: 201, type: ClinicalInfoDto })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado ou token inválido.' })
  async create(@Body() payload: ClinicalInfoDto): Promise<ClinicalInfoDto> {
    return await this.clinicalInfoService.create(payload);
  }

  @Put()
  @ApiOperation({ summary: 'Atualiza clinical info usando o clinicalInfoId do JWT.' })
  @ApiResponse({ status: 200, type: ClinicalInfoDto })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado ou token inválido.' })
  async updateByToken(@Req() req: Request, @Body() partial: Partial<ClinicalInfoDto>): Promise<ClinicalInfoDto> {
    const clinicalInfoId: string | undefined = (req as any).user?.clinicalInfo;

    if (!clinicalInfoId) {
      throw new BadRequestException('Token não contém clinicalInfoId');
    }

    return await this.clinicalInfoService.save(partial, clinicalInfoId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta clinical info usando o clinicalInfoId do JWT.' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado ou token inválido.' })
  async deleteByToken(@Req() req: Request): Promise<void> {
    const clinicalInfoId: string | undefined = (req as any).user?.clinicalInfo;

    if (!clinicalInfoId) {
      throw new BadRequestException('Token não contém clinicalInfoId');
    }

    await this.clinicalInfoService.deleteById(clinicalInfoId);
  }

  @Get('qr-code')
  @ApiOperation({ summary: 'Gera e retorna o PDF com QR Code usando o clinicalInfoId do JWT.' })
  @ApiResponse({
    status: 200,
    description: 'PDF gerado com sucesso',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado ou token inválido.' })
  async generateQrCodePdf(@Req() req: Request, @Res() res: Response) {
    const clinicalInfoId: string | undefined = (req as any).user?.clinicalInfo;
    if (!clinicalInfoId) {
      throw new BadRequestException('Token não contém clinicalInfoId');
    }

    const clinicalInfo = await this.clinicalInfoService.getById(clinicalInfoId);

    if (!clinicalInfo || !clinicalInfo.publicCode) {
      throw new BadRequestException('Este registro não possui publicCode gerado');
    }

    const publicCode: string = clinicalInfo.publicCode;

    const qrUrl: string = `${this.configService.get('FRONT_URL')}/public-access/${clinicalInfo.id}`;

    const pdfBuffer: Buffer = await this.clinicalInfoService.generatePublicQrPdf(qrUrl, publicCode);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="qr_${publicCode}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  }
}
