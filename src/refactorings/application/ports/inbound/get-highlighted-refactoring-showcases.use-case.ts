import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';

export abstract class GetHighlightedRefactoringShowcasesUseCase {
  abstract execute(): Promise<RefactoringShowcase[]>;
}
