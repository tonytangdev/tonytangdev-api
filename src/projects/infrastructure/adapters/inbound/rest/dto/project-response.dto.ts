import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Project name', example: 'Portfolio Website' })
  name: string;

  @ApiProperty({ description: 'Project description' })
  description: string;

  @ApiProperty({ description: 'Start date', example: '2023-01-01' })
  startDate: string;

  @ApiPropertyOptional({ description: 'End date', example: '2023-06-01', nullable: true })
  endDate: string | null;

  @ApiProperty({ description: 'Technologies used', type: [String], example: ['React', 'TypeScript'] })
  technologies: string[];

  @ApiPropertyOptional({ description: 'Repository URL', nullable: true })
  repositoryLink: string | null;

  @ApiPropertyOptional({ description: 'Demo URL', nullable: true })
  demoLink: string | null;

  @ApiPropertyOptional({ description: 'Website URL', nullable: true })
  websiteLink: string | null;

  @ApiProperty({ description: 'Key achievements', type: [String] })
  achievements: string[];

  @ApiProperty({ description: 'Whether project is highlighted' })
  isHighlighted: boolean;
}
