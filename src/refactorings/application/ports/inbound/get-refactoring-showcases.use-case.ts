import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';
import {
  RefactoringShowcaseFilters,
  Pagination,
  PaginatedResult,
} from '../outbound/refactoring-showcase.repository.port';

export abstract class GetRefactoringShowcasesUseCase {
  abstract execute(
    filters?: RefactoringShowcaseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<RefactoringShowcase>>;
}
