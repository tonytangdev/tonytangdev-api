import { Injectable } from '@nestjs/common';
import { RefactoringShowcase } from '../../../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../../../domain/value-objects/refactoring-file.vo';
import { RefactoringShowcaseListDto } from '../rest/dto/refactoring-showcase-list.dto';
import { RefactoringShowcaseDetailDto } from '../rest/dto/refactoring-showcase-detail.dto';
import { RefactoringStepDto } from '../rest/dto/refactoring-step.dto';
import { RefactoringFileDto } from '../rest/dto/refactoring-file.dto';

@Injectable()
export class RefactoringShowcaseMapper {
  toListDto(showcase: RefactoringShowcase): RefactoringShowcaseListDto {
    return {
      id: showcase.id,
      title: showcase.title,
      description: showcase.description,
      technologies: showcase.technologies,
      difficulty: showcase.difficulty,
      tags: showcase.tags,
      isHighlighted: showcase.isHighlighted,
      stepCount: showcase.steps.length,
    };
  }

  toDetailDto(showcase: RefactoringShowcase): RefactoringShowcaseDetailDto {
    return {
      id: showcase.id,
      title: showcase.title,
      description: showcase.description,
      technologies: showcase.technologies,
      difficulty: showcase.difficulty,
      tags: showcase.tags,
      isHighlighted: showcase.isHighlighted,
      steps: this.toStepDtoList(showcase.steps),
    };
  }

  toListDtoList(
    showcases: RefactoringShowcase[],
  ): RefactoringShowcaseListDto[] {
    return showcases.map((showcase) => this.toListDto(showcase));
  }

  private toStepDtoList(steps: RefactoringStep[]): RefactoringStepDto[] {
    return steps.map((step) => this.toStepDto(step));
  }

  private toStepDto(step: RefactoringStep): RefactoringStepDto {
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      explanation: step.explanation,
      order: step.order,
      files: this.toFileDtoList(step.files),
    };
  }

  private toFileDtoList(files: RefactoringFile[]): RefactoringFileDto[] {
    return files.map((file) => this.toFileDto(file));
  }

  private toFileDto(file: RefactoringFile): RefactoringFileDto {
    return {
      filename: file.filename,
      language: file.language,
      content: file.content,
      order: file.order,
    };
  }
}
