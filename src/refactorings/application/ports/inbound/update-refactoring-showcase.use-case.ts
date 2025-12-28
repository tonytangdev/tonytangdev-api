import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';
import { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';

export interface UpdateRefactoringFileInput {
  filename: string;
  language: string;
  content: string;
}

export interface UpdateRefactoringStepInput {
  title: string;
  description: string;
  explanation: string;
  files: UpdateRefactoringFileInput[];
}

export interface UpdateRefactoringShowcaseInput {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  difficulty: DifficultyLevel;
  tags: string[];
  isHighlighted?: boolean;
  steps: UpdateRefactoringStepInput[];
}

export abstract class UpdateRefactoringShowcaseUseCase {
  abstract execute(
    input: UpdateRefactoringShowcaseInput,
  ): Promise<RefactoringShowcase>;
}
