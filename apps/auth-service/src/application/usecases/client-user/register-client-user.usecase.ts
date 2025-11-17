import { Inject, Injectable } from '@nestjs/common';
import { RegisterClientUserDto } from 'src/application/dtos/client-user/register-client-user.dto';
import type { IClientUserMapper } from 'src/application/mapping/i-client-user.mapper';
import type { IHashService } from 'src/domain/services/i-hash.service';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import type { IVerificationCodeService } from 'src/domain/services/i-verification-code.service';
import type { INotificationService } from 'src/domain/services/i-notification.service';
import { UserAlreadyExistsException } from 'src/common/exceptions/app.exception';
import { v4 as uuidv4 } from 'uuid';
import { CommonLogger } from 'src/common/logger/common.logger';

@Injectable()
export class RegisterClientUserUsecase {
  constructor(
    @Inject('IClientUserRepository')
    private readonly clientUserRepository: IClientUserRepository,
    @Inject('IClientUserMapper')
    private readonly clientUSerMapper: IClientUserMapper,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('IVerificationCodeService')
    private readonly verificationCodeService: IVerificationCodeService,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: RegisterClientUserDto): Promise<void> {
    const emailAlreadyExists = await this.clientUserRepository.findEmail(dto.email);
    if (emailAlreadyExists) throw new UserAlreadyExistsException();

    const passwordHash = await this.hashService.hash(dto.password);
    const id = uuidv4();
    const verificationCode = this.verificationCodeService.generateCode();
    const codeExpireAt = new Date(Date.now() + this.verificationCodeService.getLongExpirationTime() * 1000);

    const entity = this.clientUSerMapper.registerDtoToEntity(dto, id, passwordHash, verificationCode, codeExpireAt);

    const created = await this.clientUserRepository.create(entity);

    CommonLogger.info('Auth', 'REGISTER_CLIENT_USER_SUCCESS', {
      email: created.getEmail(),
    });

    await this.notificationService.sendVerification(entity, verificationCode);

    return;
  }
}
