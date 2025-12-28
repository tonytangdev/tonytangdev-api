import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../../../../domain/value-objects/difficulty-level.vo';

export class PatchRefactoringFileDto {
  @ApiPropertyOptional({ example: 'before.ts' })
  @IsString()
  @IsOptional()
  filename?: string;

  @ApiPropertyOptional({ example: 'typescript' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 'function processData() { ... }' })
  @IsString()
  @IsOptional()
  content?: string;
}

export class PatchRefactoringStepDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'If provided, updates existing step; otherwise creates new',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ example: 'Identify Code Smell' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Find the duplicated logic' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Look for repeated patterns in the code...' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ type: [PatchRefactoringFileDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PatchRefactoringFileDto)
  files?: PatchRefactoringFileDto[];
}

export class PatchRefactoringShowcaseDto {
  @ApiPropertyOptional({ example: 'Extract Method Refactoring' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Learn how to extract complex code into reusable methods',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['TypeScript', 'JavaScript'] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({
    enum: DifficultyLevel,
    example: DifficultyLevel.BEGINNER,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ example: ['clean-code', 'refactoring'] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isHighlighted?: boolean;

  @ApiPropertyOptional({ type: [PatchRefactoringStepDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PatchRefactoringStepDto)
  steps?: PatchRefactoringStepDto[];
}
