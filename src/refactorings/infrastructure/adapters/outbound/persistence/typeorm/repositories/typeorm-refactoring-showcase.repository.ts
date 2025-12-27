import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  RefactoringShowcaseRepositoryPort,
  RefactoringShowcaseFilters,
  Pagination,
  PaginatedResult,
} from '../../../../../../application/ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../../../../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../../../../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../../../../../domain/value-objects/refactoring-file.vo';
import { RefactoringShowcaseOrm } from '../entities/refactoring-showcase.entity.orm';

@Injectable()
export class TypeOrmRefactoringShowcaseRepository extends RefactoringShowcaseRepositoryPort {
  constructor(
    @InjectRepository(RefactoringShowcaseOrm)
    private readonly repository: Repository<RefactoringShowcaseOrm>,
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

    const where: FindOptionsWhere<RefactoringShowcaseOrm> = {};

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    const queryBuilder = this.repository.createQueryBuilder('showcase');

    if (filters?.difficulty) {
      queryBuilder.andWhere('showcase.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.tag) {
      queryBuilder.andWhere(":tag = ANY(string_to_array(showcase.tags, ','))", {
        tag: filters.tag,
      });
    }

    if (filters?.technology) {
      queryBuilder.andWhere(
        ":technology = ANY(string_to_array(showcase.technologies, ','))",
        { technology: filters.technology },
      );
    }

    const [showcases, total] = await queryBuilder
      .leftJoinAndSelect('showcase.steps', 'steps')
      .leftJoinAndSelect('steps.files', 'files')
      .orderBy('showcase.order', 'ASC')
      .addOrderBy('steps.order', 'ASC')
      .addOrderBy('files.order', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: showcases.map((showcase) => this.toDomain(showcase)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<RefactoringShowcase | null> {
    const showcase = await this.repository.findOne({
      where: { id },
      relations: ['steps', 'steps.files'],
      order: {
        steps: { order: 'ASC', files: { order: 'ASC' } },
      },
    });
    return showcase ? this.toDomain(showcase) : null;
  }

  async findHighlighted(): Promise<RefactoringShowcase[]> {
    const showcases = await this.repository.find({
      where: { isHighlighted: true },
      relations: ['steps', 'steps.files'],
      order: {
        order: 'ASC',
        steps: { order: 'ASC', files: { order: 'ASC' } },
      },
    });
    return showcases.map((showcase) => this.toDomain(showcase));
  }

  private toDomain(orm: RefactoringShowcaseOrm): RefactoringShowcase {
    return new RefactoringShowcase({
      id: orm.id,
      title: orm.title,
      description: orm.description,
      technologies: orm.technologies,
      difficulty: orm.difficulty,
      tags: orm.tags,
      order: orm.order,
      isHighlighted: orm.isHighlighted,
      steps: orm.steps
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
