import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsIn } from 'class-validator';

export class ClinicalInfoModel {
  @ApiProperty({
    example: 'f3d3485f-ca75-4b89-b3aa-1bc367a6afeb',
    description: 'ID único do registro de informações clínicas',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'João' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Silva' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'A+' })
  @IsOptional()
  @IsString()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  blood_type?: string;

  @ApiProperty({ example: 'Masculino' })
  @IsString()
  sex: string;

  @ApiProperty({ example: '1990-05-20' })
  @IsDate()
  @Type(() => Date)
  date_of_birth: Date;

  @ApiProperty({ example: 'Paciente possui histórico de asma.' })
  @IsOptional()
  @IsString()
  other_info?: string;

  @ApiProperty({ example: '2025-11-05T19:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date;

  @ApiProperty({ example: '2025-11-05T19:30:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at: Date;
}
