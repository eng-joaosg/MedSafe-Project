import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class LoginClientUserDto {
  @ApiProperty({
    example: 'joao@gmail.com',
    description: 'E-mail do usuário.',
  })
  @IsEmail({}, { message: 'Credenciais inválidas.' })
  email: string;

  @ApiProperty({
    example: 'Joao123!',
    description: 'Senha do usuário (8 a 16 caracteres).',
  })
  @IsString({ message: 'Credenciais inválidas.' })
  @IsNotEmpty({ message: 'Credenciais inválidas.' })
  @MinLength(8, { message: 'Credenciais inválidas.' })
  @MaxLength(16, { message: 'Credenciais inválidas.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/, {
    message: 'Credenciais inválidas.',
  })
  password: string;
}
