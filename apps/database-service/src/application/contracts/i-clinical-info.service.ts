import { ClinicalInfoDto } from '../dtos/clinical-info.dto';

export interface IClinicalInfoService {
  create(model: Partial<ClinicalInfoDto>): Promise<ClinicalInfoDto>;
  save(model: Partial<ClinicalInfoDto>, id: string): Promise<ClinicalInfoDto>;
  getById(id: string): Promise<ClinicalInfoDto>;
  deleteById(id: string): Promise<void>;
  generatePublicQrPdf(qrUrl: string, publicCode: string);
  getByPublicCode(id: string, code: string): Promise<ClinicalInfoDto>;
  getAllClinicalInfo(): Promise<{
    surgeries: string[];
    diseases: string[];
    medications: string[];
    allergies: string[];
  }>;
}
