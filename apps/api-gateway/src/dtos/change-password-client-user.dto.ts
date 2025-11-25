import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordClientUserDto {
  @IsString({ message: 'Credenciais inválidas.' })
  @IsNotEmpty({ message: 'Credenciais inválidas.' })
  @MinLength(8, { message: 'Credenciais inválidas.' })
  @MaxLength(16, { message: 'Credenciais inválidas.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/, {
    message: 'Credenciais inválidas.',
  })
  password: string;

  @IsString({ message: 'Nova senha inválida.' })
  @IsNotEmpty({ message: 'Nova senha inválida.' })
  @MinLength(8, { message: 'Nova senha inválida.' })
  @MaxLength(16, { message: 'Nova senha inválida.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/, {
    message: 'Nova senha inválida.',
  })
  newPassword: string;
}
