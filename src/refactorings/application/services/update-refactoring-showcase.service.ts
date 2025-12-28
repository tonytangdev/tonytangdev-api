import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  UpdateRefactoringShowcaseInput,
  UpdateRefactoringShowcaseUseCase,
  UpdateRefactoringStepInput,
  UpdateRefactoringFileInput,
} from '../ports/inbound/update-refactoring-showcase.use-case';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../domain/value-objects/refactoring-file.vo';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';

@Injectable()
export class UpdateRefactoringShowcaseService implements UpdateRefactoringShowcaseUseCase {
  constructor(
    private readonly refactoringShowcaseRepository: RefactoringShowcaseRepositoryPort,
  ) {}

  async execute(
    input: UpdateRefactoringShowcaseInput,
  ): Promise<RefactoringShowcase> {
    const existingShowcase = await this.verifyShowcaseExists(input.id);
    const order = this.preserveOrderFromExisting(existingShowcase);
    const steps = this.buildStepsWithOrder(input.steps, input.id);
    const updatedShowcase = this.buildUpdatedShowcase(input, order, steps);

    return this.refactoringShowcaseRepository.update(updatedShowcase);
  }

  private async verifyShowcaseExists(id: string): Promise<RefactoringShowcase> {
    const showcase = await this.refactoringShowcaseRepository.findById(id);
    if (!showcase) {
      throw new NotFoundException(
        `Refactoring showcase with ID ${id} not found`,
      );
    }
    return showcase;
  }

  private preserveOrderFromExisting(showcase: RefactoringShowcase): number {
    return showcase.order;
  }

  private buildUpdatedShowcase(
    input: UpdateRefactoringShowcaseInput,
    order: number,
    steps: RefactoringStep[],
  ): RefactoringShowcase {
    return new RefactoringShowcase({
      id: input.id,
      title: input.title,
      description: input.description,
      technologies: input.technologies,
      difficulty: input.difficulty,
      tags: input.tags,
      order,
      isHighlighted: input.isHighlighted ?? false,
      steps,
    });
  }

  private buildStepsWithOrder(
    stepsInput: UpdateRefactoringStepInput[],
    showcaseId: string,
  ): RefactoringStep[] {
    return stepsInput.map((stepInput, index) => {
      const stepId = randomUUID();
      const files = this.buildFilesWithOrder(stepInput.files);

      return new RefactoringStep({
        id: stepId,
        showcaseId,
        title: stepInput.title,
        description: stepInput.description,
        explanation: stepInput.explanation,
        order: index,
        files,
      });
    });
  }

  private buildFilesWithOrder(
    filesInput: UpdateRefactoringFileInput[],
  ): RefactoringFile[] {
    return filesInput.map((fileInput, index) => {
      return new RefactoringFile({
        filename: fileInput.filename,
        language: fileInput.language,
        content: fileInput.content,
        order: index,
      });
    });
  }
}
