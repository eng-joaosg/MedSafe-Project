import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyClientUserUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d+$/, {
    message: 'O código deve conter apenas números',
  })
  code: string;
}
