import { ClientUser } from '../../domain/entities/client-user.entity';
import { ClientUserDbtDto } from '../dtos/client-user/client-user-db.dto';
import { RegisterClientUserDto } from '../dtos/client-user/register-client-user.dto';
import { IClientUserMapper } from './i-client-user.mapper';

export class ClientUserMapper implements IClientUserMapper {
  public toDbRequestDto(entity: ClientUser): ClientUserDbtDto {
    return new ClientUserDbtDto(
      entity.getId().toString(),
      entity.getEmail(),
      entity.getPasswordHash(),
      entity.getClinicalInfoId(),
      entity.getFirstName(),
      entity.getLastName(),
      entity.getIsActive(),
      entity.getVerificationCode(),
      entity.getCodeExpiresAt(),
      entity.getCreatedAt(),
      entity.getUpdatedAt(),
    );
  }
  public dbResponseToEntity(dto: ClientUserDbtDto) {
    return new ClientUser(
      dto.id,
      dto.email,
      dto.password_hash,
      dto.clinical_info_id,
      dto.first_name,
      dto.last_name,
      dto.is_active,
      dto.verification_code,
      dto.code_expires_at,
      dto.created_at,
      dto.updated_at,
    );
  }
  public registerDtoToEntity(dto: RegisterClientUserDto, id: string, passwordHash: string, verificationCode: string, codeExpiresAt: Date) {
    return new ClientUser(
      id,
      dto.email,
      passwordHash,
      null,
      dto.firstName,
      dto.lastName,
      false,
      verificationCode,
      codeExpiresAt,
      null,
      null,
    );
  }
}
