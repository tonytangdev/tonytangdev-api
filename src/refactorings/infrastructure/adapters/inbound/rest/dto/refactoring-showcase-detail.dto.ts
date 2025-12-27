import { RefactoringStepDto } from './refactoring-step.dto';

export class RefactoringShowcaseDetailDto {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  tags: string[];
  isHighlighted: boolean;
  steps: RefactoringStepDto[];
}
