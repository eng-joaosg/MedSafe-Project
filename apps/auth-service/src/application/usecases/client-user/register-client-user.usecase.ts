import { Inject, Injectable } from '@nestjs/common';
import { RegisterClientUserDto } from '../../../application/dtos/client-user/register-client-user.dto';
import type { IClientUserMapper } from '../../../application/mapping/i-client-user.mapper';
import type { IHashService } from '../../../domain/services/i-hash.service';
import type { IClientUserRepository } from '../../../domain/repositories/i-client-user.repository';
import type { IVerificationCodeService } from '../../../domain/services/i-verification-code.service';
import type { INotificationService } from '../../../domain/services/i-notification.service';
import { UserAlreadyExistsException } from '../../../common/exceptions/app.exception';
import { v4 as uuidv4 } from 'uuid';
import { CommonLogger } from '../../../common/logger/common.logger';
import {
  CLIENT_USER_MAPPER,
  CLIENT_USER_REPOSITORY,
  HASH_SERVICE,
  NOTIFICATION_SERVICE,
  VERIFICATION_CODE_SERVICE,
} from '../../../common/utils/tokens.contants';

@Injectable()
export class RegisterClientUserUsecase {
  constructor(
    @Inject(CLIENT_USER_REPOSITORY)
    private readonly clientUserRepository: IClientUserRepository,
    @Inject(CLIENT_USER_MAPPER)
    private readonly clientUSerMapper: IClientUserMapper,
    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,
    @Inject(VERIFICATION_CODE_SERVICE)
    private readonly verificationCodeService: IVerificationCodeService,
    @Inject(NOTIFICATION_SERVICE)
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
