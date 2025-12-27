import { ApiProperty } from '@nestjs/swagger';
import { RefactoringFileDto } from './refactoring-file.dto';

export class RefactoringStepDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Step title', example: 'Extract Method' })
  title: string;

  @ApiProperty({ description: 'Step description' })
  description: string;

  @ApiProperty({ description: 'Detailed explanation of changes' })
  explanation: string;

  @ApiProperty({ description: 'Step order' })
  order: number;

  @ApiProperty({
    description: 'Code files for this step',
    type: [RefactoringFileDto],
  })
  files: RefactoringFileDto[];
}
