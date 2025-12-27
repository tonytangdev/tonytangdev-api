import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EducationResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Educational institution', example: 'Stanford University' })
  institution: string;

  @ApiProperty({ description: 'Degree type', example: 'Bachelor of Science' })
  degreeType: string;

  @ApiProperty({ description: 'Field of study', example: 'Computer Science' })
  fieldOfStudy: string;

  @ApiProperty({ description: 'Start date', example: '2015-09-01' })
  startDate: string;

  @ApiPropertyOptional({ description: 'End date', example: '2019-06-01', nullable: true })
  endDate: string | null;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Achievements', type: [String] })
  achievements: string[];

  @ApiProperty({ description: 'Location', example: 'Stanford, CA' })
  location: string;

  @ApiProperty({ description: 'Status', example: 'completed' })
  status: string;

  @ApiProperty({ description: 'Whether education is highlighted' })
  isHighlighted: boolean;
}
