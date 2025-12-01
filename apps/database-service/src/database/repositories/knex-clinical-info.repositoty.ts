import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ClinicalInfoDto } from '../../application/dtos/clinical-info.dto';
import { TABLES } from '../../common/contants/tables.contants';
import { DatabaseOperationException } from '../../common/exceptions/app.exceptions';
import { IClinicalInfoRepository } from '../../application/repositories/i-clinical-info.repository';
import { KNEX_CONNECTION } from '../../common/contants/tokens.contants';

@Injectable()
export class KnexClinicalInfoRepository implements IClinicalInfoRepository {
  constructor(
    @Inject(KNEX_CONNECTION)
    private readonly knex: Knex,
  ) {}

  async getById(id: string): Promise<ClinicalInfoDto | null> {
    try {
      const row = await this.knex(TABLES.CLINICAL_INFO).where({ id }).first();
      if (!row) return null;

      // --- Buscar informações relacionadas ---
      const allergiesRows = await this.knex(TABLES.CLINICAL_INFO_ALLERGY)
        .join(TABLES.ALLERGY, `${TABLES.CLINICAL_INFO_ALLERGY}.allergy_id`, `${TABLES.ALLERGY}.id`)
        .where({ clinical_info_id: id })
        .select(`${TABLES.ALLERGY}.name`, `${TABLES.CLINICAL_INFO_ALLERGY}.severity`);

      const diseases = await this.knex(TABLES.CLINICAL_INFO_DISEASE)
        .join(TABLES.DISEASE, `${TABLES.CLINICAL_INFO_DISEASE}.disease_id`, `${TABLES.DISEASE}.id`)
        .where({ clinical_info_id: id })
        .pluck(`${TABLES.DISEASE}.name`);

      const medicationsRows = await this.knex(TABLES.CLINICAL_INFO_MEDICATION)
        .join(TABLES.MEDICATION, `${TABLES.CLINICAL_INFO_MEDICATION}.medication_id`, `${TABLES.MEDICATION}.id`)
        .where({ clinical_info_id: id })
        .select(
          `${TABLES.MEDICATION}.name`,
          `${TABLES.CLINICAL_INFO_MEDICATION}.dosage`,
          `${TABLES.CLINICAL_INFO_MEDICATION}.usage_interval`,
        );

      const surgeries = await this.knex(TABLES.CLINICAL_INFO_SURGERY)
        .join(TABLES.SURGERY, `${TABLES.CLINICAL_INFO_SURGERY}.surgery_id`, `${TABLES.SURGERY}.id`)
        .where({ clinical_info_id: id })
        .pluck(`${TABLES.SURGERY}.name`);

      const contactsRows = await this.knex(TABLES.EMERGENCY_CONTACT)
        .where({ clinical_info_id: id })
        .orderBy('id')
        .select('id', 'first_name', 'last_name', 'ddd', 'phone', 'relationship');

      // --- Mapeamento para o DTO ---
      const dto: ClinicalInfoDto = {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        bloodType: row.blood_type,
        sex: row.sex,
        dateOfBirth: row.date_of_birth,
        otherInfo: row.other_info,
        publicCode: row.public_code,
        createdAt: row.created_at,
        updatedAt: row.updated_at,

        allergies: allergiesRows.map((a) => ({
          name: a.name,
          severity: a.severity ?? '',
        })),

        diseases,

        medications: medicationsRows.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          usageInterval: m.usage_interval,
        })),

        surgeries,

        contacts: contactsRows.map((c) => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          ddd: c.ddd,
          phone: c.phone,
          relationship: c.relationship,
        })),
      };
      return dto;
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao buscar ClinicalInfo por ID: ${id}`, error);
    }
  }

  async save(dto: Partial<ClinicalInfoDto>, id: string): Promise<ClinicalInfoDto | null> {
    try {
      const existing = await this.knex(TABLES.CLINICAL_INFO).where({ id }).first();

      const payload: any = {
        first_name: dto.firstName,
        last_name: dto.lastName,
        blood_type: dto.bloodType,
        sex: dto.sex,
        date_of_birth: dto.dateOfBirth,
        other_info: dto.otherInfo,
        public_code: dto.publicCode,
      };

      if (!existing) {
        const [row] = await this.knex(TABLES.CLINICAL_INFO)
          .insert({ ...payload, created_at: this.knex.fn.now(), updated_at: this.knex.fn.now() })
          .returning('*');
        id = row.id;
      } else {
        await this.knex(TABLES.CLINICAL_INFO)
          .where({ id })
          .update({ ...payload, updated_at: this.knex.fn.now() });
      }

      // --- ALERGIAS ---
      await this.knex(TABLES.CLINICAL_INFO_ALLERGY).where({ clinical_info_id: id }).delete();
      if (dto.allergies?.length) {
        for (const item of dto.allergies) {
          const allergy = await this.knex(TABLES.ALLERGY).where({ name: item.name }).first();
          if (allergy) {
            await this.knex(TABLES.CLINICAL_INFO_ALLERGY).insert({
              clinical_info_id: id,
              allergy_id: allergy.id,
              severity: item.severity ?? '',
            });
          }
        }
      }

      // --- DOENÇAS ---
      await this.knex(TABLES.CLINICAL_INFO_DISEASE).where({ clinical_info_id: id }).delete();
      if (dto.diseases?.length) {
        for (const name of dto.diseases) {
          const disease = await this.knex(TABLES.DISEASE).where({ name }).first();
          if (disease) {
            await this.knex(TABLES.CLINICAL_INFO_DISEASE).insert({
              clinical_info_id: id,
              disease_id: disease.id,
            });
          }
        }
      }

      // --- MEDICAMENTOS ---
      await this.knex(TABLES.CLINICAL_INFO_MEDICATION).where({ clinical_info_id: id }).delete();
      if (dto.medications?.length) {
        for (const med of dto.medications) {
          const medRow = await this.knex(TABLES.MEDICATION).where({ name: med.name }).first();
          if (medRow) {
            await this.knex(TABLES.CLINICAL_INFO_MEDICATION).insert({
              clinical_info_id: id,
              medication_id: medRow.id,
              dosage: med.dosage ?? '',
              usage_interval: med.usageInterval ?? '',
            });
          }
        }
      }

      // --- CIRURGIAS ---
      await this.knex(TABLES.CLINICAL_INFO_SURGERY).where({ clinical_info_id: id }).delete();
      if (dto.surgeries?.length) {
        for (const name of dto.surgeries) {
          const surgery = await this.knex(TABLES.SURGERY).where({ name }).first();
          if (surgery) {
            await this.knex(TABLES.CLINICAL_INFO_SURGERY).insert({
              clinical_info_id: id,
              surgery_id: surgery.id,
            });
          }
        }
      }

      // --- CONTATOS ---
      const existingContacts = await this.knex(TABLES.EMERGENCY_CONTACT).where({ clinical_info_id: id }).select('id');

      for (let contactId = 1; contactId <= 3; contactId++) {
        const payload = dto.contacts?.find((c) => c.id === contactId);

        if (!existingContacts.some((ec) => ec.id === contactId)) {
          await this.knex(TABLES.EMERGENCY_CONTACT).insert({
            clinical_info_id: id,
            id: contactId,
            first_name: payload?.firstName ?? '',
            last_name: payload?.lastName ?? '',
            ddd: payload?.ddd ?? '',
            phone: payload?.phone ?? '',
            relationship: payload?.relationship ?? '',
            created_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
          });
        } else if (payload) {
          await this.knex(TABLES.EMERGENCY_CONTACT)
            .where({ clinical_info_id: id, id: contactId })
            .update({
              first_name: payload.firstName ?? '',
              last_name: payload.lastName ?? '',
              ddd: payload.ddd ?? '',
              phone: payload.phone ?? '',
              relationship: payload.relationship ?? '',
              updated_at: this.knex.fn.now(),
            });
        }
      }

      return this.getById(id);
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao salvar ClinicalInfo: ${id}`, error);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.knex(TABLES.CLINICAL_INFO_ALLERGY).where({ clinical_info_id: id }).delete();
      await this.knex(TABLES.CLINICAL_INFO_DISEASE).where({ clinical_info_id: id }).delete();
      await this.knex(TABLES.CLINICAL_INFO_MEDICATION).where({ clinical_info_id: id }).delete();
      await this.knex(TABLES.CLINICAL_INFO_SURGERY).where({ clinical_info_id: id }).delete();
      await this.knex(TABLES.EMERGENCY_CONTACT).where({ clinical_info_id: id }).delete();
      await this.knex(TABLES.CLINICAL_INFO).where({ id }).delete();
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao deletar ClinicalInfo: ${id}`, error);
    }
  }

  async getAllClinicalInfo() {
    try {
      return {
        surgeries: await this.knex(TABLES.SURGERY).pluck('name'),
        diseases: await this.knex(TABLES.DISEASE).pluck('name'),
        medications: await this.knex(TABLES.MEDICATION).pluck('name'),
        allergies: await this.knex(TABLES.ALLERGY).pluck('name'),
      };
    } catch (error) {
      throw new DatabaseOperationException('Erro ao buscar informações clínicas', error);
    }
  }
}
