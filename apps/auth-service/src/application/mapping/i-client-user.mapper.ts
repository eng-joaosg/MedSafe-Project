import { AuthTokenOutput } from '../../domain/services/i-token.service';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { ClientUserDbtDto } from '../dtos/client-user/client-user-db.dto';
import { RegisterClientUserDto } from '../dtos/client-user/register-client-user.dto';
import { SessionDto } from '../dtos/client-user/session.dto';

export interface IClientUserMapper {
  toDbRequestDto(entity: ClientUser): ClientUserDbtDto;
  toSessionDto(entity: ClientUser, token: AuthTokenOutput): SessionDto;
  dbResponseToEntity(dto: ClientUserDbtDto): ClientUser;
  toDbRequestPartialDto(partial: Partial<ClientUserDbtDto>): ClientUserDbtDto;

  registerDtoToEntity(
    dto: RegisterClientUserDto,
    id: string,
    passwordHash: string,
    verificationCode: string,
    codeExpiresAt: Date,
  ): ClientUser;
}
