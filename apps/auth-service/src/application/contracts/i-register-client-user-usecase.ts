import { RegisterClientUserDto } from 'src/application/dtos/client-user/register-client-user.dto';

export interface IRegisterClientUserUsecase {
  execute(dto: RegisterClientUserDto): Promise<void>;
}
