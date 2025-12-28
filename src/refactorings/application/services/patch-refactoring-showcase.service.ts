import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PatchRefactoringShowcaseInput,
  PatchRefactoringShowcaseUseCase,
  PatchRefactoringStepInput,
  PatchRefactoringFileInput,
} from '../ports/inbound/patch-refactoring-showcase.use-case';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../domain/value-objects/refactoring-file.vo';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';

@Injectable()
export class PatchRefactoringShowcaseService implements PatchRefactoringShowcaseUseCase {
  constructor(private readonly repository: RefactoringShowcaseRepositoryPort) {}

  async execute(
    input: PatchRefactoringShowcaseInput,
  ): Promise<RefactoringShowcase> {
    const existing = await this.verifyShowcaseExists(input.id);
    const merged = this.mergeShowcase(existing, input);
    return this.repository.patch(merged);
  }

  private async verifyShowcaseExists(id: string): Promise<RefactoringShowcase> {
    const showcase = await this.repository.findById(id);
    if (!showcase) {
      throw new NotFoundException(
        `Refactoring showcase with ID ${id} not found`,
      );
    }
    return showcase;
  }

  private mergeShowcase(
    existing: RefactoringShowcase,
    input: PatchRefactoringShowcaseInput,
  ): RefactoringShowcase {
    const steps = this.mergeSteps(existing.steps, input.steps, existing.id);

    return new RefactoringShowcase({
      id: existing.id,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      technologies: input.technologies ?? existing.technologies,
      difficulty: input.difficulty ?? existing.difficulty,
      tags: input.tags ?? existing.tags,
      order: existing.order,
      isHighlighted: input.isHighlighted ?? existing.isHighlighted,
      steps,
    });
  }

  private mergeSteps(
    existingSteps: RefactoringStep[],
    inputSteps: PatchRefactoringStepInput[] | undefined,
    showcaseId: string,
  ): RefactoringStep[] {
    if (inputSteps === undefined) {
      return existingSteps;
    }

    if (inputSteps.length === 0) {
      return [];
    }

    const existingStepMap = new Map(
      existingSteps.map((step) => [step.id, step]),
    );
    const resultSteps: RefactoringStep[] = [];

    for (const [index, stepInput] of inputSteps.entries()) {
      if (stepInput.id && existingStepMap.has(stepInput.id)) {
        const existingStep = existingStepMap.get(stepInput.id)!;
        resultSteps.push(this.mergeStep(existingStep, stepInput));
        existingStepMap.delete(stepInput.id);
      } else {
        resultSteps.push(this.createNewStep(stepInput, showcaseId, index));
      }
    }

    for (const remainingStep of existingStepMap.values()) {
      resultSteps.push(remainingStep);
    }

    return resultSteps;
  }

  private mergeStep(
    existing: RefactoringStep,
    input: PatchRefactoringStepInput,
  ): RefactoringStep {
    const files = this.mergeFiles(existing.files, input.files);

    return new RefactoringStep({
      id: existing.id,
      showcaseId: existing.showcaseId,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      explanation: input.explanation ?? existing.explanation,
      order: existing.order,
      files,
    });
  }

  private createNewStep(
    input: PatchRefactoringStepInput,
    showcaseId: string,
    order: number,
  ): RefactoringStep {
    return new RefactoringStep({
      id: randomUUID(),
      showcaseId,
      title: input.title ?? '',
      description: input.description ?? '',
      explanation: input.explanation ?? '',
      order,
      files: this.buildFiles(input.files ?? []),
    });
  }

  private mergeFiles(
    existingFiles: RefactoringFile[],
    inputFiles: PatchRefactoringFileInput[] | undefined,
  ): RefactoringFile[] {
    if (inputFiles === undefined) {
      return existingFiles;
    }
    return this.buildFiles(inputFiles);
  }

  private buildFiles(
    filesInput: PatchRefactoringFileInput[],
  ): RefactoringFile[] {
    return filesInput.map((fileInput, index) => {
      return new RefactoringFile({
        filename: fileInput.filename ?? '',
        language: fileInput.language ?? '',
        content: fileInput.content ?? '',
        order: index,
      });
    });
  }
}
