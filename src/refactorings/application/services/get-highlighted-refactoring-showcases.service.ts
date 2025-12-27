import { Injectable } from '@nestjs/common';
import { GetHighlightedRefactoringShowcasesUseCase } from '../ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';

@Injectable()
export class GetHighlightedRefactoringShowcasesService implements GetHighlightedRefactoringShowcasesUseCase {
  constructor(
    private readonly refactoringShowcaseRepo: RefactoringShowcaseRepositoryPort,
  ) {}

  async execute(): Promise<RefactoringShowcase[]> {
    return this.refactoringShowcaseRepo.findHighlighted();
  }
}
