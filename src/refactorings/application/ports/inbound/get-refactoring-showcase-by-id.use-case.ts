import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';

export abstract class GetRefactoringShowcaseByIdUseCase {
  abstract execute(id: string): Promise<RefactoringShowcase | null>;
}
