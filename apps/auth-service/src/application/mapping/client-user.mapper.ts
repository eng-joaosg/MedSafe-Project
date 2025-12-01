import { AuthTokenOutput } from 'src/domain/services/i-token.service';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { ClientUserDbtDto } from '../dtos/client-user/client-user-db.dto';
import { RegisterClientUserDto } from '../dtos/client-user/register-client-user.dto';
import { SessionDto } from '../dtos/client-user/session.dto';
import { IClientUserMapper } from './i-client-user.mapper';

export class ClientUserMapper implements IClientUserMapper {
  public toDbRequestDto(entity: ClientUser): ClientUserDbtDto {
    return {
      id: entity.getId().toString(),
      email: entity.getEmail(),
      password_hash: entity.getPasswordHash(),
      clinical_info_id: entity.getClinicalInfoId(),
      first_name: entity.getFirstName(),
      last_name: entity.getLastName(),
      is_active: entity.getIsActive(),
      verification_code: entity.getVerificationCode(),
      code_expires_at: entity.getCodeExpiresAt(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
    };
  }

  public toDbRequestPartialDto(partial: Partial<ClientUserDbtDto>): ClientUserDbtDto {
    const dto: ClientUserDbtDto = { ...partial };
    Object.keys(dto).forEach((key) => dto[key] === undefined && delete dto[key]);
    return dto;
  }

  public dbResponseToEntity(dto: ClientUserDbtDto) {
    return new ClientUser(
      dto.id!,
      dto.email!,
      dto.password_hash!,
      dto.clinical_info_id ?? null,
      dto.first_name!,
      dto.last_name!,
      dto.is_active,
      dto.verification_code ?? null,
      dto.code_expires_at ?? null,
      dto.created_at!,
      dto.updated_at!,
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

  public toSessionDto(entity: ClientUser, token: AuthTokenOutput): SessionDto {
    return new SessionDto(
      entity.getId().toString(),
      entity.getEmail(),
      entity.getRole(),
      entity.getFirstName(),
      entity.getLastName(),
      token,
      entity.getClinicalInfoId(),
    );
  }
}
