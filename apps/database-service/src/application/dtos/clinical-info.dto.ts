import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsArray, ValidateNested, IsInt, IsNumber, Length } from 'class-validator';

export class ContactDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 'João' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Silva' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '11' })
  @IsOptional()
  @IsString()
  ddd?: string;

  @ApiProperty({ example: '999999999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Pai' })
  @IsOptional()
  @IsString()
  relationship?: string;
}

export class AllergyDto {
  @ApiProperty({ example: 'Poeira' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Alta' })
  @IsString()
  severity!: string;
}

export class MedicationDto {
  @ApiProperty({ example: 'Ibuprofeno' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 500 })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({ example: 8 })
  @IsOptional()
  @IsNumber()
  usageInterval?: number;
}

export class ClinicalInfoDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  otherInfo?: string;

  @ApiProperty({ type: [AllergyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllergyDto)
  allergies?: AllergyDto[];

  @ApiProperty({ type: [MedicationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  diseases?: string[];

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  surgeries?: string[];

  @ApiProperty({ type: [ContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts?: ContactDto[];

  @ApiProperty({ example: 'A1B2C3', description: 'Código público de 6 caracteres' })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'O código público deve ter exatamente 6 caracteres' })
  publicCode?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;
}
