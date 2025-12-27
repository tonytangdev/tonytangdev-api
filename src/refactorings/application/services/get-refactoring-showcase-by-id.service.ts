import { Injectable } from '@nestjs/common';
import { GetRefactoringShowcaseByIdUseCase } from '../ports/inbound/get-refactoring-showcase-by-id.use-case';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';

@Injectable()
export class GetRefactoringShowcaseByIdService implements GetRefactoringShowcaseByIdUseCase {
  constructor(
    private readonly refactoringShowcaseRepo: RefactoringShowcaseRepositoryPort,
  ) {}

  async execute(id: string): Promise<RefactoringShowcase | null> {
    return this.refactoringShowcaseRepo.findById(id);
  }
}
