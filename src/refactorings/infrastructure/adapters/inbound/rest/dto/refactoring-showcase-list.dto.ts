import { ApiProperty } from '@nestjs/swagger';

export class RefactoringShowcaseListDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Showcase title', example: 'Clean Code Refactoring' })
  title: string;

  @ApiProperty({ description: 'Brief description' })
  description: string;

  @ApiProperty({ description: 'Technologies used', type: [String], example: ['TypeScript'] })
  technologies: string[];

  @ApiProperty({ description: 'Difficulty level', example: 'intermediate' })
  difficulty: string;

  @ApiProperty({ description: 'Tags for categorization', type: [String], example: ['clean-code'] })
  tags: string[];

  @ApiProperty({ description: 'Whether showcase is highlighted' })
  isHighlighted: boolean;

  @ApiProperty({ description: 'Number of refactoring steps' })
  stepCount: number;
}
