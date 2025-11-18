import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class ClientUserModel {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'joao.silva@exemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '$2b$10$abcdefghijklmnopqrstuvwxyz.hash.example',
    description: 'Hash da senha (Exposto APENAS para o Auth Service)',
  })
  @Expose({ name: 'password_hash' })
  @IsString()
  password_hash!: string;

  @ApiProperty({ example: true })
  @Expose({ name: 'is_active' })
  @IsBoolean()
  is_active!: boolean;

  @ApiProperty({ example: 'João' })
  @Expose({ name: 'first_name' })
  @IsString()
  first_name!: string;

  @ApiProperty({ example: 'Silva' })
  @Expose({ name: 'last_name' })
  @IsString()
  last_name!: string;

  @ApiProperty({ example: '2025-11-05T19:00:00.000Z' })
  @IsOptional()
  created_at: Date | null;

  @ApiProperty({ example: '2025-11-05T19:30:00.000Z' })
  @IsOptional()
  updated_at: Date | null;

  @ApiProperty({ example: '123456', nullable: true })
  @IsOptional()
  verification_code: string | null;

  @ApiProperty({ example: '2025-11-05T20:00:00.000Z', nullable: true })
  @IsOptional()
  code_expires_at: Date | null;

  @ApiProperty({
    example: 'f3d3485f-ca75-4b89-b3aa-1bc367a6afeb',
    nullable: true,
    description: 'ID do paciente vinculado, se aplicável',
  })
  @Expose({ name: 'patient_id' })
  @IsOptional()
  clinical_info_id: string | null;
}
