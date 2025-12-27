import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { GetRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-refactoring-showcases.use-case';
import { GetRefactoringShowcaseByIdUseCase } from '../../../../application/ports/inbound/get-refactoring-showcase-by-id.use-case';
import { GetHighlightedRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { RefactoringShowcaseMapper } from '../mappers/refactoring-showcase.mapper';
import { DifficultyLevel } from '../../../../domain/value-objects/difficulty-level.vo';

@Controller('refactorings')
export class RefactoringsController {
  constructor(
    private readonly getRefactoringShowcasesUseCase: GetRefactoringShowcasesUseCase,
    private readonly getRefactoringShowcaseByIdUseCase: GetRefactoringShowcaseByIdUseCase,
    private readonly getHighlightedRefactoringShowcasesUseCase: GetHighlightedRefactoringShowcasesUseCase,
    private readonly refactoringShowcaseMapper: RefactoringShowcaseMapper,
  ) {}

  @Get()
  async getRefactoringShowcases(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('difficulty') difficulty?: string,
    @Query('tag') tag?: string,
    @Query('technology') technology?: string,
  ) {
    const filters = {
      ...(difficulty && { difficulty: difficulty as DifficultyLevel }),
      ...(tag && { tag }),
      ...(technology && { technology }),
    };

    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    const result = await this.getRefactoringShowcasesUseCase.execute(
      Object.keys(filters).length > 0 ? filters : undefined,
      pagination,
    );

    const data = this.refactoringShowcaseMapper.toListDtoList(result.data);

    return {
      data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('highlighted')
  async getHighlightedRefactoringShowcases() {
    const showcases =
      await this.getHighlightedRefactoringShowcasesUseCase.execute();
    const data = this.refactoringShowcaseMapper.toListDtoList(showcases);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get(':id')
  async getRefactoringShowcaseById(@Param('id') id: string) {
    const showcase = await this.getRefactoringShowcaseByIdUseCase.execute(id);

    if (!showcase) {
      throw new NotFoundException(
        `Refactoring showcase with id '${id}' not found`,
      );
    }

    const data = this.refactoringShowcaseMapper.toDetailDto(showcase);

    return {
      data,
      meta: {},
    };
  }
}
