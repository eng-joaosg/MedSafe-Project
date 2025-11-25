import { VerifyAccountClientUserDto } from '../dtos/client-user/verify-account-client-user.dto';

export interface IVerifyAccountClientUserUseCase {
  execute(dto: VerifyAccountClientUserDto): Promise<boolean>;
}
