import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsUrl,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Platform',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A full-featured e-commerce platform with payment integration',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Project start date (ISO format)',
    example: '2024-01-15',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Project end date (ISO format)',
    example: '2024-06-30',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  endDate?: string | null;

  @ApiProperty({
    description: 'Technologies used in the project',
    example: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  technologies: string[];

  @ApiPropertyOptional({
    description: 'Repository URL',
    example: 'https://github.com/tonytangdev/ecommerce-platform',
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  repositoryLink?: string | null;

  @ApiPropertyOptional({
    description: 'Demo URL',
    example: 'https://demo.ecommerce-platform.com',
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  demoLink?: string | null;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://ecommerce-platform.com',
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  websiteLink?: string | null;

  @ApiPropertyOptional({
    description: 'Project achievements',
    example: [
      'Reduced checkout time by 40%',
      'Processed over 10,000 transactions',
    ],
    type: [String],
    nullable: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  achievements?: string[];

  @ApiProperty({
    description: 'Whether this project is highlighted',
    example: true,
  })
  @IsBoolean()
  isHighlighted: boolean;
}
