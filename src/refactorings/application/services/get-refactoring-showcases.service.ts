import { Injectable } from '@nestjs/common';
import { GetRefactoringShowcasesUseCase } from '../ports/inbound/get-refactoring-showcases.use-case';
import {
  RefactoringShowcaseRepositoryPort,
  RefactoringShowcaseFilters,
  Pagination,
  PaginatedResult,
} from '../ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';

@Injectable()
export class GetRefactoringShowcasesService implements GetRefactoringShowcasesUseCase {
  constructor(
    private readonly refactoringShowcaseRepo: RefactoringShowcaseRepositoryPort,
  ) {}

  async execute(
    filters?: RefactoringShowcaseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<RefactoringShowcase>> {
    return this.refactoringShowcaseRepo.findAll(filters, pagination);
  }
}
