import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ClientUserModel } from '../../application/models/client-user.model';
import { TABLES } from '../../common/contants/tables.contants';
import { DatabaseOperationException } from '../../common/exceptions/app.exceptions';
import { IClientUserRepository } from '../../application/repositories/i-client-user.repository';
import { KNEX_CONNECTION } from '../../common/contants/tokens.contants';

@Injectable()
export class KnexClientUserRepository implements IClientUserRepository {
  constructor(
    @Inject(KNEX_CONNECTION)
    private readonly knex: Knex,
  ) {}

  async getById(id: string): Promise<ClientUserModel | null> {
    try {
      const row = await this.knex(TABLES.CLIENT_USER).where({ id }).first();
      return row || null;
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao buscar ClientUser por ID: ${id}`, error);
    }
  }

  async getByEmail(email: string): Promise<ClientUserModel | null> {
    try {
      const row = await this.knex(TABLES.CLIENT_USER).where({ email }).first();
      return row || null;
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao buscar ClientUser por email: ${email}`, error);
    }
  }

  async save(model: Partial<ClientUserModel>, id: string | null): Promise<ClientUserModel> {
    try {
      const existing = await this.knex(TABLES.CLIENT_USER).where({ id: id }).first();
      const cleanPayload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(model)) {
        if (value !== undefined) {
          cleanPayload[key] = value;
        }
      }

      if (!existing) {
        const data = {
          ...cleanPayload,
          created_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        };

        const [row] = await this.knex(TABLES.CLIENT_USER).insert(data).returning('*');

        return row;
      }

      const updateData = {
        ...cleanPayload,
        updated_at: this.knex.fn.now(),
      };

      const [row] = await this.knex(TABLES.CLIENT_USER).where({ id: id }).update(updateData).returning('*');

      return row;
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao salvar ClientUser: ${id}`, error);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.knex(TABLES.CLIENT_USER).where({ id }).delete();
    } catch (error) {
      throw new DatabaseOperationException(`Erro ao deletar ClientUser: ${id}`, error);
    }
  }
}
