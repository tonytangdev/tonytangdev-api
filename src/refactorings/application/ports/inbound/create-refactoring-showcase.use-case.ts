import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';
import { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';

export interface CreateRefactoringFileInput {
  filename: string;
  language: string;
  content: string;
}

export interface CreateRefactoringStepInput {
  title: string;
  description: string;
  explanation: string;
  files: CreateRefactoringFileInput[];
}

export interface CreateRefactoringShowcaseInput {
  title: string;
  description: string;
  technologies: string[];
  difficulty: DifficultyLevel;
  tags: string[];
  isHighlighted?: boolean;
  steps: CreateRefactoringStepInput[];
}

export abstract class CreateRefactoringShowcaseUseCase {
  abstract execute(
    input: CreateRefactoringShowcaseInput,
  ): Promise<RefactoringShowcase>;
}
