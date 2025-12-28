import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateRefactoringShowcaseInput,
  CreateRefactoringShowcaseUseCase,
  CreateRefactoringStepInput,
  CreateRefactoringFileInput,
} from '../ports/inbound/create-refactoring-showcase.use-case';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../domain/value-objects/refactoring-file.vo';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';

@Injectable()
export class CreateRefactoringShowcaseService implements CreateRefactoringShowcaseUseCase {
  constructor(
    private readonly refactoringShowcaseRepository: RefactoringShowcaseRepositoryPort,
  ) {}

  async execute(
    input: CreateRefactoringShowcaseInput,
  ): Promise<RefactoringShowcase> {
    const order = await this.getNextOrder();
    const showcaseId = randomUUID();
    const steps = this.buildStepsWithOrder(input.steps, showcaseId);
    const showcase = this.buildShowcase(input, showcaseId, order, steps);

    return this.refactoringShowcaseRepository.create(showcase);
  }

  private async getNextOrder(): Promise<number> {
    const maxOrder = await this.refactoringShowcaseRepository.getMaxOrder();
    return maxOrder + 1;
  }

  private buildShowcase(
    input: CreateRefactoringShowcaseInput,
    showcaseId: string,
    order: number,
    steps: RefactoringStep[],
  ): RefactoringShowcase {
    return new RefactoringShowcase({
      id: showcaseId,
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
    stepsInput: CreateRefactoringStepInput[],
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
    filesInput: CreateRefactoringFileInput[],
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
