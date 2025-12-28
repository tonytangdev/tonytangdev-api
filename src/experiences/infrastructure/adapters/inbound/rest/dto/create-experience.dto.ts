import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateExperienceDto {
  @ApiProperty({ example: 'Anthropic' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2023-01-15' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-06-30', nullable: true })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'Building AI-powered applications' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['TypeScript', 'React', 'Node.js'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  technologies: string[];

  @ApiPropertyOptional({
    example: ['Led team of 5 engineers', 'Increased performance by 50%'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  achievements?: string[];

  @ApiProperty({ example: 'San Francisco, CA' })
  @IsString()
  @IsNotEmpty()
  location: string;
}
