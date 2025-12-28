import { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';
import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';

export interface PatchRefactoringFileInput {
  filename?: string;
  language?: string;
  content?: string;
}

export interface PatchRefactoringStepInput {
  id?: string;
  title?: string;
  description?: string;
  explanation?: string;
  files?: PatchRefactoringFileInput[];
}

export interface PatchRefactoringShowcaseInput {
  id: string;
  title?: string;
  description?: string;
  technologies?: string[];
  difficulty?: DifficultyLevel;
  tags?: string[];
  isHighlighted?: boolean;
  steps?: PatchRefactoringStepInput[];
}

export abstract class PatchRefactoringShowcaseUseCase {
  abstract execute(
    input: PatchRefactoringShowcaseInput,
  ): Promise<RefactoringShowcase>;
}
