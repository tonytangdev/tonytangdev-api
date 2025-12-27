import { Injectable } from '@nestjs/common';
import {
  RefactoringShowcaseRepositoryPort,
  RefactoringShowcaseFilters,
  Pagination,
  PaginatedResult,
} from '../../../../../application/ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../../../../domain/entities/refactoring-showcase.entity';
import { seedRefactoringShowcases } from './seed-data';

@Injectable()
export class InMemoryRefactoringShowcaseRepository extends RefactoringShowcaseRepositoryPort {
  private showcases: RefactoringShowcase[] = [...seedRefactoringShowcases];

  async findAll(
    filters?: RefactoringShowcaseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<RefactoringShowcase>> {
    let filtered = [...this.showcases];

    // Apply filters
    if (filters?.difficulty) {
      filtered = filtered.filter(
        (showcase) => showcase.difficulty === filters.difficulty,
      );
    }
    if (filters?.tag) {
      filtered = filtered.filter((showcase) =>
        showcase.tags.includes(filters.tag!),
      );
    }
    if (filters?.technology) {
      filtered = filtered.filter((showcase) =>
        showcase.technologies
          .map((t) => t.toLowerCase().replace(/\s+/g, '-'))
          .includes(filters.technology!.toLowerCase()),
      );
    }

    // Sort by order
    filtered.sort((a, b) => a.order - b.order);

    const total = filtered.length;

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filtered.slice(startIndex, endIndex);

    return Promise.resolve({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  async findById(id: string): Promise<RefactoringShowcase | null> {
    return Promise.resolve(
      this.showcases.find((showcase) => showcase.id === id) || null,
    );
  }

  async findHighlighted(): Promise<RefactoringShowcase[]> {
    return Promise.resolve(
      this.showcases
        .filter((showcase) => showcase.isHighlighted)
        .sort((a, b) => a.order - b.order),
    );
  }
}
