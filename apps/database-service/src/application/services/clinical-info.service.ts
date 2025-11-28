import { Inject, Injectable } from '@nestjs/common';
import { ClinicalInfoDto } from '../dtos/clinical-info.dto';
import { ClinicalInfoNotFoundException } from '../../common/exceptions/app.exceptions';
import type { IClinicalInfoService } from '../contracts/i-clinical-info.service';
import type { IClinicalInfoRepository } from '../repositories/i-clinical-info.repository';
import { CLINICAL_INFO_REPOSITORY } from '../../common/contants/tokens.contants';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClinicalInfoService implements IClinicalInfoService {
  constructor(
    @Inject(CLINICAL_INFO_REPOSITORY)
    private readonly clinicalInfoRepository: IClinicalInfoRepository,
  ) {}

  async create(dto: Partial<ClinicalInfoDto>): Promise<ClinicalInfoDto> {
    const id: string = uuidv4();
    const savedModel = await this.clinicalInfoRepository.save(dto, id);
    if (!savedModel) {
      throw new ClinicalInfoNotFoundException(`ClinicalInfo ID ${id} não foi encontrado`);
    }
    return this.rowToDto(savedModel);
  }

  async save(dto: Partial<ClinicalInfoDto>, id: string): Promise<ClinicalInfoDto> {
    const savedModel = await this.clinicalInfoRepository.save(dto, id);
    if (!savedModel) {
      throw new ClinicalInfoNotFoundException(`ClinicalInfo ID ${id} não foi encontrado`);
    }
    return this.rowToDto(savedModel);
  }

  async getById(id: string): Promise<ClinicalInfoDto> {
    const model = await this.clinicalInfoRepository.getById(id);
    if (!model) throw new ClinicalInfoNotFoundException(`ClinicalInfo com ID ${id} não foi encontrado`);
    return this.rowToDto(model);
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

  // -------------------
  // Helpers privados
  // -------------------
  private rowToDto(row: any): ClinicalInfoDto {
    return {
      id: row.id,
      firstName: row.first_name ?? row.firstName,
      lastName: row.last_name ?? row.lastName,
      bloodType: row.blood_type ?? row.bloodType,
      sex: row.sex,
      dateOfBirth: row.date_of_birth ?? row.dateOfBirth,
      otherInfo: row.other_info ?? row.otherInfo,
      allergies: row.allergies,
      diseases: row.diseases,
      medications: row.medications,
      surgeries: row.surgeries,
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }
}
