import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ClientUserModel {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789' })
  id!: string;

  @ApiProperty({ example: 'joao.silva@exemplo.com' })
  email!: string;

  @ApiProperty({
    example: '$2b$10$abcdefghijklmnopqrstuvwxyz.hash.example',
    description: 'Hash da senha (Exposto APENAS para o Auth Service)',
  })
  @Expose({ name: 'password_hash' })
  password_hash!: string;

  @ApiProperty({ example: true })
  @Expose({ name: 'is_active' })
  is_active!: boolean;

  @ApiProperty({ example: 'João' })
  @Expose({ name: 'first_name' })
  first_name!: string;

  @ApiProperty({ example: 'Silva' })
  @Expose({ name: 'last_name' })
  last_name!: string;

  @ApiProperty({ example: '2025-11-05T19:00:00.000Z' })
  created_at!: Date | null;

  @ApiProperty({ example: '2025-11-05T19:30:00.000Z' })
  updated_at!: Date | null;

  @ApiProperty({ example: '123456', nullable: true })
  verification_code?: string | null;

  @ApiProperty({ example: '2025-11-05T20:00:00.000Z', nullable: true })
  code_expires_at?: Date | null;

  @ApiProperty({
    example: 'f3d3485f-ca75-4b89-b3aa-1bc367a6afeb',
    nullable: true,
    description: 'ID do paciente vinculado, se aplicável',
  })
  @Expose({ name: 'patient_id' })
  clinical_info_id?: string | null;
}
