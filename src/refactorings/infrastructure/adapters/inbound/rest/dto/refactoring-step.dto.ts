import { RefactoringFileDto } from './refactoring-file.dto';

export class RefactoringStepDto {
  id: string;
  title: string;
  description: string;
  explanation: string;
  order: number;
  files: RefactoringFileDto[];
}
