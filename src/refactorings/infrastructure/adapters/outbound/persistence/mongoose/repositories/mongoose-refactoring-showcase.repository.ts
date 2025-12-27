import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefactoringShowcaseRepositoryPort,
  RefactoringShowcaseFilters,
  Pagination,
  PaginatedResult,
} from '../../../../../../application/ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../../../../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../../../../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../../../../../domain/value-objects/refactoring-file.vo';
import {
  RefactoringShowcaseSchema,
  RefactoringShowcaseDocument,
} from '../schemas/refactoring-showcase.schema';

@Injectable()
export class MongooseRefactoringShowcaseRepository extends RefactoringShowcaseRepositoryPort {
  constructor(
    @InjectModel(RefactoringShowcaseSchema.name)
    private readonly model: Model<RefactoringShowcaseDocument>,
  ) {
    super();
  }

  async findAll(
    filters?: RefactoringShowcaseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<RefactoringShowcase>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters?.tag) {
      query.tags = filters.tag;
    }

    if (filters?.technology) {
      query.technologies = filters.technology;
    }

    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ order: 1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: docs.map((doc) => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<RefactoringShowcase | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findHighlighted(): Promise<RefactoringShowcase[]> {
    const docs = await this.model
      .find({ isHighlighted: true })
      .sort({ order: 1 })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: RefactoringShowcaseDocument): RefactoringShowcase {
    return new RefactoringShowcase({
      id: doc._id,
      title: doc.title,
      description: doc.description,
      technologies: doc.technologies,
      difficulty: doc.difficulty,
      tags: doc.tags,
      order: doc.order,
      isHighlighted: doc.isHighlighted,
      steps: doc.steps
        .sort((a, b) => a.order - b.order)
        .map(
          (step) =>
            new RefactoringStep({
              id: step.id,
              showcaseId: step.showcaseId,
              title: step.title,
              description: step.description,
              explanation: step.explanation,
              order: step.order,
              files: step.files
                .sort((a, b) => a.order - b.order)
                .map(
                  (file) =>
                    new RefactoringFile({
                      filename: file.filename,
                      language: file.language,
                      content: file.content,
                      order: file.order,
                    }),
                ),
            }),
        ),
    });
  }
}
