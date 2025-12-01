import { Inject, Injectable } from '@nestjs/common';
import type { IClientUserRepository } from '../repositories/i-client-user.repository';
import { ClientUserModel } from '../models/client-user.model';
import { UserNotFoundException } from '../../common/exceptions/app.exceptions';
import type { IClientUserService } from '../contracts/i-client-user.service';
import { CLIENT_USER_REPOSITORY } from '../../common/contants/tokens.contants';

@Injectable()
export class ClientUserService implements IClientUserService {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly clientUserRepository: IClientUserRepository,
  ) {}

  async save(id: string, model: Partial<ClientUserModel>): Promise<ClientUserModel> {
    const payload = { ...model };

    const result = await this.clientUserRepository.save(payload, id);

    if (!result) {
      throw new UserNotFoundException(`ClientUser com ID ${id} não foi encontrado`);
    }

    return result;
  }

  async getById(id: string): Promise<ClientUserModel> {
    const result = await this.clientUserRepository.getById(id);
    if (!result) throw new UserNotFoundException(`ClientUser com ID ${id} não foi encontrado`);
    return result;
  }

  async getByClinicalInfoId(id: string): Promise<ClientUserModel> {
    const result = await this.clientUserRepository.getById(id);
    if (!result) throw new UserNotFoundException(`ClientUser com ClinicalInfoId ${id} não foi encontrado`);
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
