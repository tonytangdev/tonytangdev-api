import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExperienceResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Company name', example: 'Tech Corp' })
  company: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  title: string;

  @ApiProperty({ description: 'Start date', example: '2020-01-01' })
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2023-12-31',
    nullable: true,
  })
  endDate: string | null;

  @ApiProperty({ description: 'Job description' })
  description: string;

  @ApiProperty({
    description: 'Technologies used',
    type: [String],
    example: ['TypeScript', 'React'],
  })
  technologies: string[];

  @ApiProperty({ description: 'Key achievements', type: [String] })
  achievements: string[];

  @ApiProperty({ description: 'Work location', example: 'San Francisco, CA' })
  location: string;

  @ApiProperty({ description: 'Whether this is current employment' })
  isCurrent: boolean;

  @ApiProperty({ description: 'Whether experience is highlighted' })
  isHighlighted: boolean;
}
