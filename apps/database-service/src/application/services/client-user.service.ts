import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../repositories/i-client-user.repository';
import { ClientUserModel } from '../models/client-user.model';
import { UserNotFoundException } from 'src/common/exceptions/app.exceptions';

@Injectable()
export class ClientUserService {
  constructor(
    @Inject('IClientUserRepository')
    private readonly clientUserRepository: IClientUserRepository,
  ) {}

  async save(model: ClientUserModel): Promise<ClientUserModel> {
    const result = await this.clientUserRepository.save(model);
    if (!result) throw new UserNotFoundException(`ClientUser com ID ${model.id} não foi encontrado`);
    return result;
  }

  async getById(id: string): Promise<ClientUserModel> {
    const result = await this.clientUserRepository.getById(id);
    if (!result) throw new UserNotFoundException(`ClientUser com ID ${id} não foi encontrado`);
    return result;
  }

  async getByEmail(email: string): Promise<ClientUserModel> {
    const result = await this.clientUserRepository.getByEmail(email);
    if (!result) throw new UserNotFoundException(`Usuário com o email ${email} não foi encontrado`);
    return result;
  }

  async deleteById(id: string): Promise<void> {
    await this.clientUserRepository.deleteById(id);
  }

  async findEmail(email: string): Promise<boolean> {
    const result = await this.clientUserRepository.getByEmail(email);
    return !!result;
  }
}
