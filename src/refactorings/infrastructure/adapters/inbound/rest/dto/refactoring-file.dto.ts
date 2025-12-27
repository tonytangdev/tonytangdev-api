import { ApiProperty } from '@nestjs/swagger';

export class RefactoringFileDto {
  @ApiProperty({ description: 'File name', example: 'example.ts' })
  filename: string;

  @ApiProperty({ description: 'Programming language', example: 'typescript' })
  language: string;

  @ApiProperty({ description: 'File content' })
  content: string;

  @ApiProperty({ description: 'Display order' })
  order: number;
}
