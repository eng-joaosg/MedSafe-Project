import { ClientUser } from '../../domain/entities/client-user.entity';
import { ClientUserDbtDto } from '../dtos/client-user/client-user-db.dto';
import { RegisterClientUserDto } from '../dtos/client-user/register-client-user.dto';

export interface IClientUserMapper {
  toDbRequestDto(entity: ClientUser): ClientUserDbtDto;
  dbResponseToEntity(dto: ClientUserDbtDto): ClientUser;
  registerDtoToEntity(
    dto: RegisterClientUserDto,
    id: string,
    passwordHash: string,
    verificationCode: string,
    codeExpiresAt: Date,
  ): ClientUser;
}
