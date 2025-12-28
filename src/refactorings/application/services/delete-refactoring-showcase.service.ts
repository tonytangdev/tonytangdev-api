import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteRefactoringShowcaseInput,
  DeleteRefactoringShowcaseUseCase,
} from '../ports/inbound/delete-refactoring-showcase.use-case';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';

@Injectable()
export class DeleteRefactoringShowcaseService implements DeleteRefactoringShowcaseUseCase {
  constructor(
    private readonly refactoringShowcaseRepo: RefactoringShowcaseRepositoryPort,
  ) {}

  async execute(input: DeleteRefactoringShowcaseInput): Promise<void> {
    const existingShowcase = await this.refactoringShowcaseRepo.findById(
      input.id,
    );
    if (!existingShowcase) {
      throw new NotFoundException(
        `Refactoring showcase with id '${input.id}' not found`,
      );
    }
    await this.refactoringShowcaseRepo.delete(input.id);
  }
}
