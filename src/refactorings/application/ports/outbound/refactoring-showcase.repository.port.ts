import { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';
import { RefactoringShowcase } from '../../../domain/entities/refactoring-showcase.entity';

export interface RefactoringShowcaseFilters {
  difficulty?: DifficultyLevel;
  tag?: string;
  technology?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class RefactoringShowcaseRepositoryPort {
  abstract findAll(
    filters?: RefactoringShowcaseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<RefactoringShowcase>>;
  abstract findById(id: string): Promise<RefactoringShowcase | null>;
  abstract findHighlighted(): Promise<RefactoringShowcase[]>;
}
