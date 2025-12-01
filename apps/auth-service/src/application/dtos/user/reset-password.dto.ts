import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'O e-mail informado é inválido.' })
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d+$/, {
    message: 'O código deve conter apenas números',
  })
  verificationCode: string;

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
  newPassword: string;
}
