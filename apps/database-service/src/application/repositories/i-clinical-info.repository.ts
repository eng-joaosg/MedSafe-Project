import { ClinicalInfoDto } from '../dtos/clinical-info.dto';

export interface IClinicalInfoRepository {
  save(dto: Partial<ClinicalInfoDto>, id: string): Promise<ClinicalInfoDto | null>;
  getById(id: string): Promise<ClinicalInfoDto | null>;
  deleteById(id: string): Promise<void>;
  getAllClinicalInfo(): Promise<{
    surgeries: string[];
    diseases: string[];
    medications: string[];
    allergies: string[];
  }>;
}
