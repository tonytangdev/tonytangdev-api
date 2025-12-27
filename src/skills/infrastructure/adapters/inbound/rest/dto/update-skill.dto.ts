import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ProficiencyLevel } from '../../../../../domain/value-objects/proficiency-level.vo';

export class UpdateSkillDto {
  @ApiProperty({ description: 'Skill name', example: 'TypeScript' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Proficiency level',
    enum: ProficiencyLevel,
    example: ProficiencyLevel.ADVANCED,
  })
  @IsEnum(ProficiencyLevel)
  proficiency: ProficiencyLevel;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number | null;

  @ApiProperty({
    description: 'Whether this skill is highlighted',
    example: true,
  })
  @IsBoolean()
  isHighlighted: boolean;
}
