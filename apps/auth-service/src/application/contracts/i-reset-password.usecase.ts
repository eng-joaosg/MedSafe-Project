import { ResetPasswordDto } from '../dtos/user/reset-password.dto';

export interface IResetPasswordUsecase {
  execute(dto: ResetPasswordDto): Promise<void>;
}
