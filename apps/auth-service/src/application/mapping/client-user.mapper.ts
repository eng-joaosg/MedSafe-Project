import { ClienteUser } from '../../domain/entities/client-user.entity';
import { ClientUserDbtDto } from '../dtos/client-user/client-user-db.dto';

export class ClientUserMapper {
  public toDbRequestDto(entity: ClienteUser): ClientUserDbtDto {
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
    return new ClienteUser(
      dto.id,
      dto.email,
      dto.passwordHash,
      dto.clinicalInfoId,
      dto.firstName,
      dto.lastName,
      dto.isActive,
      dto.verificationCode,
      dto.codeExpiresAt,
      dto.createdAt,
      dto.updatedAt,
    );
  }
}
