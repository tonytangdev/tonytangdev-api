import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../../../../domain/value-objects/difficulty-level.vo';

export class UpdateRefactoringFileDto {
  @ApiProperty({ example: 'before.ts' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 'typescript' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ example: 'function processData() { ... }' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateRefactoringStepDto {
  @ApiProperty({ example: 'Identify Code Smell' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Find the duplicated logic' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Look for repeated patterns in the code...' })
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiProperty({ type: [UpdateRefactoringFileDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRefactoringFileDto)
  files: UpdateRefactoringFileDto[];
}

export class UpdateRefactoringShowcaseDto {
  @ApiProperty({ example: 'Extract Method Refactoring' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Learn how to extract complex code into reusable methods',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['TypeScript', 'JavaScript'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  technologies: string[];

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.BEGINNER })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty({ example: ['clean-code', 'refactoring'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isHighlighted?: boolean;

  @ApiProperty({ type: [UpdateRefactoringStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRefactoringStepDto)
  steps: UpdateRefactoringStepDto[];
}
