import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-refactoring-showcases.use-case';
import { GetRefactoringShowcaseByIdUseCase } from '../../../../application/ports/inbound/get-refactoring-showcase-by-id.use-case';
import { GetHighlightedRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { CreateRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/create-refactoring-showcase.use-case';
import { UpdateRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/update-refactoring-showcase.use-case';
import { PatchRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/patch-refactoring-showcase.use-case';
import { DeleteRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/delete-refactoring-showcase.use-case';
import { RefactoringShowcaseMapper } from '../mappers/refactoring-showcase.mapper';
import { DifficultyLevel } from '../../../../domain/value-objects/difficulty-level.vo';
import { RefactoringShowcaseListDto } from './dto/refactoring-showcase-list.dto';
import { RefactoringShowcaseDetailDto } from './dto/refactoring-showcase-detail.dto';
import { CreateRefactoringShowcaseDto } from './dto/create-refactoring-showcase.dto';
import { UpdateRefactoringShowcaseDto } from './dto/update-refactoring-showcase.dto';
import { PatchRefactoringShowcaseDto } from './dto/patch-refactoring-showcase.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('refactorings')
@Controller('refactorings')
export class RefactoringsController {
  constructor(
    private readonly getRefactoringShowcasesUseCase: GetRefactoringShowcasesUseCase,
    private readonly getRefactoringShowcaseByIdUseCase: GetRefactoringShowcaseByIdUseCase,
    private readonly getHighlightedRefactoringShowcasesUseCase: GetHighlightedRefactoringShowcasesUseCase,
    private readonly createRefactoringShowcaseUseCase: CreateRefactoringShowcaseUseCase,
    private readonly updateRefactoringShowcaseUseCase: UpdateRefactoringShowcaseUseCase,
    private readonly patchRefactoringShowcaseUseCase: PatchRefactoringShowcaseUseCase,
    private readonly deleteRefactoringShowcaseUseCase: DeleteRefactoringShowcaseUseCase,
    private readonly refactoringShowcaseMapper: RefactoringShowcaseMapper,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all refactoring showcases with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    description: 'Filter by difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({
    name: 'technology',
    required: false,
    description: 'Filter by technology',
  })
  @ApiResponse({
    status: 200,
    description: 'Refactoring showcases retrieved successfully',
    type: [RefactoringShowcaseListDto],
  })
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
  @ApiOperation({ summary: 'Get highlighted refactoring showcases' })
  @ApiResponse({
    status: 200,
    description: 'Highlighted refactoring showcases retrieved successfully',
    type: [RefactoringShowcaseListDto],
  })
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
  @ApiOperation({ summary: 'Get refactoring showcase detail by ID' })
  @ApiParam({ name: 'id', description: 'Refactoring showcase ID' })
  @ApiResponse({
    status: 200,
    description: 'Refactoring showcase detail retrieved successfully',
    type: RefactoringShowcaseDetailDto,
  })
  @ApiNotFoundResponse({ description: 'Refactoring showcase not found' })
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

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new refactoring showcase' })
  @ApiResponse({
    status: 201,
    description: 'Refactoring showcase created successfully',
    type: RefactoringShowcaseDetailDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  async createRefactoringShowcase(@Body() dto: CreateRefactoringShowcaseDto) {
    const showcase = await this.createRefactoringShowcaseUseCase.execute(dto);
    const data = this.refactoringShowcaseMapper.toDetailDto(showcase);

    return {
      data,
      meta: {},
    };
  }

  @Put(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Update an existing refactoring showcase' })
  @ApiParam({ name: 'id', description: 'Refactoring showcase ID' })
  @ApiResponse({
    status: 200,
    description: 'Refactoring showcase updated successfully',
    type: RefactoringShowcaseDetailDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiNotFoundResponse({ description: 'Refactoring showcase not found' })
  async updateRefactoringShowcase(
    @Param('id') id: string,
    @Body() dto: UpdateRefactoringShowcaseDto,
  ) {
    const showcase = await this.updateRefactoringShowcaseUseCase.execute({
      id,
      ...dto,
    });
    const data = this.refactoringShowcaseMapper.toDetailDto(showcase);

    return {
      data,
      meta: {},
    };
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Partially update a refactoring showcase' })
  @ApiParam({ name: 'id', description: 'Refactoring showcase ID' })
  @ApiResponse({
    status: 200,
    description: 'Refactoring showcase patched successfully',
    type: RefactoringShowcaseDetailDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiNotFoundResponse({ description: 'Refactoring showcase not found' })
  async patchRefactoringShowcase(
    @Param('id') id: string,
    @Body() dto: PatchRefactoringShowcaseDto,
  ) {
    const showcase = await this.patchRefactoringShowcaseUseCase.execute({
      id,
      ...dto,
    });
    const data = this.refactoringShowcaseMapper.toDetailDto(showcase);

    return {
      data,
      meta: {},
    };
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Delete a refactoring showcase' })
  @ApiParam({ name: 'id', description: 'Refactoring showcase ID' })
  @ApiResponse({
    status: 200,
    description: 'Refactoring showcase deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiNotFoundResponse({ description: 'Refactoring showcase not found' })
  @ApiBearerAuth('api-key')
  async deleteRefactoringShowcase(@Param('id') id: string) {
    await this.deleteRefactoringShowcaseUseCase.execute({ id });
    return { data: null, meta: {} };
  }
}
