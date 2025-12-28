import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { DegreeType } from '../../../../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../../../../domain/value-objects/education-status.vo';

export class CreateEducationDto {
  @ApiProperty({
    description: 'Institution name',
    example: 'Stanford University',
  })
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiProperty({
    description: 'Degree type',
    example: 'master',
    enum: DegreeType,
  })
  @IsEnum(DegreeType)
  degreeType: DegreeType;

  @ApiProperty({
    description: 'Field of study',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @ApiProperty({
    description: 'Start date (ISO format)',
    example: '2020-09-01',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date (ISO format)',
    example: '2022-06-15',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  endDate?: string | null;

  @ApiProperty({
    description: 'Education description',
    example: 'Master of Science in Computer Science with focus on AI',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Location',
    example: 'Stanford, CA',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'completed',
    enum: EducationStatus,
  })
  @IsEnum(EducationStatus)
  @IsOptional()
  status?: EducationStatus;

  @ApiPropertyOptional({
    description: 'Achievements',
    example: ['Summa Cum Laude', 'Research Assistant'],
    type: [String],
    nullable: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  achievements?: string[];
}
