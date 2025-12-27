import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProficiencyLevel } from '../../../../../domain/value-objects/proficiency-level.vo';

export class SkillResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Skill name', example: 'TypeScript' })
  name: string;

  @ApiProperty({
    description: 'Proficiency level',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  proficiency: ProficiencyLevel;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
    nullable: true,
  })
  yearsOfExperience: number | null;

  @ApiProperty({ description: 'Whether skill is highlighted' })
  isHighlighted: boolean;
}
