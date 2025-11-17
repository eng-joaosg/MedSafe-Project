import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterClientUserDto {
  @ApiProperty({ example: 'joao@gmail.com', description: 'E-mail do usuário' })
  @IsEmail({}, { message: 'O e-mail informado é inválido.' })
  email: string;

  @ApiProperty({ example: 'João', description: 'Primeiro nome do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  firstName: string;

  @ApiProperty({ example: 'Gonçalves', description: 'Sobrenome do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O sobrenome não pode ser vazio.' })
  lastName: string;

  @ApiProperty({
    example: 'Joao123!',
    description: 'Senha do usuário (8 a 16 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial)',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(16, { message: 'A senha deve ter no máximo 16 caracteres.' })
  @Matches(/(?=.*[a-z])/, { message: 'A senha deve conter ao menos uma letra minúscula.' })
  @Matches(/(?=.*[A-Z])/, { message: 'A senha deve conter ao menos uma letra maiúscula.' })
  @Matches(/(?=.*\d)/, { message: 'A senha deve conter ao menos um número.' })
  @Matches(/(?=.*[!@#$%&*])/, { message: 'A senha deve conter ao menos um caractere especial (!@#$%&*).' })
  password: string;
}
