import { ApiProperty } from '@nestjs/swagger';
import { SkillResponseDto } from './skill-response.dto';

export class SkillCategoryResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Programming Languages',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'programming-languages',
  })
  slug: string;

  @ApiProperty({
    description: 'Skills in this category',
    type: [SkillResponseDto],
  })
  skills: SkillResponseDto[];
}
