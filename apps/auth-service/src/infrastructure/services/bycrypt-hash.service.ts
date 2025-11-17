import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { IHashService } from 'src/domain/services/i-hash.service';
import { CommonLogger } from 'src/common/logger/common.logger';

@Injectable()
export class BcryptHashService implements IHashService {
  private readonly saltRounds: number;
  private readonly serviceName = 'BcryptHashService';

  constructor(private readonly configService: ConfigService) {
    const raw = this.configService.get<string | number>('HASH_SALT_ROUNDS');
    const rounds = typeof raw === 'string' ? parseInt(raw, 10) : (raw as number);
    this.saltRounds = Number.isFinite(rounds) ? rounds : 10;

    if (this.saltRounds < 10) {
      throw new InternalServerErrorException('HASH_SALT_ROUNDS deve ser pelo menos 10.');
    }
  }

  private validarSenha(senha: string) {
    if (!senha) {
      throw new BadRequestException('A senha não pode ser vazia.');
    }
    if (senha.length < 8 || senha.length > 16) {
      throw new BadRequestException('A senha deve ter entre 8 e 16 caracteres.');
    }
    if (!/[A-Z]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra maiúscula.');
    }
    if (!/[a-z]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra minúscula.');
    }
    if (!/[0-9]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos um número.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos um caractere especial.');
    }
  }

  public async hash(data: string): Promise<string> {
    try {
      this.validarSenha(data);

      CommonLogger.info(this.serviceName, 'hash', `Gerando hash para a senha, comprimento: ${data?.length}`);
      const hash = await bcrypt.hash(data, this.saltRounds);
      CommonLogger.info(this.serviceName, 'hash', `Hash gerado (len): ${hash.length}`);
      return hash;
    } catch (error) {
      CommonLogger.error(this.serviceName, 'hash', 'Erro ao gerar hash', error);
      throw new InternalServerErrorException('Falha ao gerar o hash da senha. ' + (error?.message ?? ''));
    }
  }

  public async compare(data: string, encrypted: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, encrypted);
    } catch (error) {
      CommonLogger.error(this.serviceName, 'compare', 'Erro ao comparar senha', error);
      return false;
    }
  }
}
