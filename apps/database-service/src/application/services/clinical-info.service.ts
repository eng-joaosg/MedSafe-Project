import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClinicalInfoDto } from '../dtos/clinical-info.dto';
import { ClinicalInfoNotFoundException } from '../../common/exceptions/app.exceptions';
import type { IClinicalInfoService } from '../contracts/i-clinical-info.service';
import type { IClinicalInfoRepository } from '../repositories/i-clinical-info.repository';
import { CLINICAL_INFO_REPOSITORY } from '../../common/contants/tokens.contants';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClinicalInfoService implements IClinicalInfoService {
  constructor(
    @Inject(CLINICAL_INFO_REPOSITORY)
    private readonly clinicalInfoRepository: IClinicalInfoRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: Partial<ClinicalInfoDto>): Promise<ClinicalInfoDto> {
    const id: string = uuidv4();
    const savedModel = await this.clinicalInfoRepository.save(dto, id);
    if (!savedModel) {
      throw new ClinicalInfoNotFoundException(`ClinicalInfo ID ${id} não foi encontrado`);
    }
    return savedModel;
  }

  async save(dto: Partial<ClinicalInfoDto>, id: string): Promise<ClinicalInfoDto> {
    const savedModel = await this.clinicalInfoRepository.save(dto, id);
    if (!savedModel) {
      throw new ClinicalInfoNotFoundException(`ClinicalInfo ID ${id} não foi encontrado`);
    }
    return savedModel;
  }

  async getById(id: string): Promise<ClinicalInfoDto> {
    const model = await this.clinicalInfoRepository.getById(id);
    if (!model) throw new ClinicalInfoNotFoundException(`ClinicalInfo com ID ${id} não foi encontrado`);
    return model;
  }

  async getByPublicCode(id: string, code: string): Promise<ClinicalInfoDto> {
    const model = await this.clinicalInfoRepository.getById(id);
    if (!model) throw new ClinicalInfoNotFoundException(`ClinicalInfo com ID ${id} não foi encontrado`);
    if (code !== model.publicCode) throw new UnauthorizedException('Código de acesso inválido.');
    return model;
  }

  async deleteById(id: string): Promise<void> {
    await this.clinicalInfoRepository.deleteById(id);
  }

  async getAllClinicalInfo(): Promise<{
    surgeries: string[];
    diseases: string[];
    medications: string[];
    allergies: string[];
  }> {
    return await this.clinicalInfoRepository.getAllClinicalInfo();
  }

  async generatePublicQrPdf(qrUrl: string, publicCode: string): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Uint8Array[] = [];
    const env = this.configService.get<string>('NODE_ENV') || 'development';

    doc.on('data', (chunk: Uint8Array) => buffers.push(chunk));

    const finishedPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    const qrBuffer: Buffer = await QRCode.toBuffer(qrUrl, { type: 'png', width: 100 });

    const headerFontSize = 11;
    doc.fontSize(headerFontSize).text('Dados Médicos', { align: 'center' });

    const spacingAfterHeader = -1;
    const y = doc.y + spacingAfterHeader;

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const qrSize = 100;
    const x = doc.page.margins.left + (pageWidth - qrSize) / 2;

    doc.image(qrBuffer, x, y, { width: qrSize, height: qrSize });

    const spacingAfterQr = 2;
    doc.y = y + qrSize + spacingAfterQr;
    const codeFontSize = 10;
    doc.fontSize(codeFontSize).text(`Código de acesso: ${publicCode}`, { align: 'center' });

    const spacingAfterCode = 10;
    doc.y += spacingAfterCode;
    doc.fontSize(12).text('Recorte e coloque em seu crachá, ou onde desejar.', { align: 'center' });
    doc.y += spacingAfterCode;
    if (env === 'development') {
      doc.fontSize(12).text(`Link do perfil (apenas em dev): ${qrUrl}`, { align: 'center' });
    }
    doc.end();

    return finishedPromise;
  }
}
