import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ClientUserModel } from '../../application/models/client-user.model';
import { TABLES } from 'src/common/contants/tables.contants';
import { DatabaseOperationException } from 'src/common/exceptions/app.exceptions';
import { IClientUserRepository } from 'src/application/repositories/i-client-user.repository';

@Injectable()
export class KnexClientUserRepository implements IClientUserRepository {
  constructor(
    @Inject('KNEX_CONNECTION')
    private readonly knex: Knex,
  ) {}

  async getById(id: string): Promise<ClientUserModel | null> {
    try {
      const row = await this.knex(TABLES.CLIENT_USER).where({ id }).first();
      return row || null;
    } catch (error) {
      throw new DatabaseOperationException(`Erro de conexão ao buscar ClientUser por ID: ${id}`, error);
    }
  }
  async getByEmail(email: string): Promise<ClientUserModel | null> {
    try {
      const row = await this.knex(TABLES.CLIENT_USER).where({ email }).first();
      return row || null;
    } catch (error) {
      throw new DatabaseOperationException(`Erro de conexão ao buscar ClientUser por email: ${email}`, error);
    }
  }
  async save(model: ClientUserModel): Promise<ClientUserModel> {
    try {
      const existing = await this.knex(TABLES.CLIENT_USER).where({ id: model.id }).first();

      const data = {
        name: model.first_name,
        email: model.email,
        updated_at: this.knex.fn.now(),
      };

      let row: any;

      if (existing) {
        [row] = await this.knex(TABLES.CLIENT_USER).where({ id: model.id }).update(data).returning('*');
      } else {
        [row] = await this.knex(TABLES.CLIENT_USER)
          .insert({ ...data, id: model.id, created_at: this.knex.fn.now() })
          .returning('*');
      }

      return row;
    } catch (error) {
      throw new DatabaseOperationException(`Erro de conexão ao salvar ClientUser: ${model.id}`, error);
    }
  }
  async deleteById(id: string): Promise<void> {
    try {
      await this.knex(TABLES.CLIENT_USER).where({ id }).delete();
    } catch (error) {
      throw new DatabaseOperationException(`Erro de conexão ao deletar ClientUser: ${id}`, error);
    }
  }
}
