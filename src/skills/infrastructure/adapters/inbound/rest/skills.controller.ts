import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GetSkillsUseCase } from '../../../../application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from '../../../../application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from '../../../../application/ports/inbound/get-highlighted-skills.use-case';
import { SkillMapper } from '../mappers/skill.mapper';
import { SkillCategoryResponseDto } from './dto/skill-category-response.dto';
import { SkillResponseDto } from './dto/skill-response.dto';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly getSkillsUseCase: GetSkillsUseCase,
    private readonly getSkillsByCategoryUseCase: GetSkillsByCategoryUseCase,
    private readonly getHighlightedSkillsUseCase: GetHighlightedSkillsUseCase,
    private readonly skillMapper: SkillMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills grouped by category' })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
    type: [SkillCategoryResponseDto],
  })
  async getSkills() {
    const grouped = await this.getSkillsUseCase.execute();
    const data = this.skillMapper.toGroupedDto(grouped);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all skill categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [SkillCategoryResponseDto],
  })
  async getCategories() {
    const grouped = await this.getSkillsUseCase.execute();
    const data = this.skillMapper.toGroupedDto(grouped);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Get skills by category slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({
    status: 200,
    description: 'Skills for category retrieved successfully',
    type: SkillCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  async getSkillsByCategory(@Param('slug') slug: string) {
    const result = await this.getSkillsByCategoryUseCase.execute(slug);

    if (!result) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    const data = this.skillMapper.toCategoryWithSkillsDto(
      result.category,
      result.skills,
    );

    return {
      data,
      meta: { total: data.skills.length },
    };
  }

  @Get('highlighted')
  @ApiOperation({ summary: 'Get highlighted skills' })
  @ApiResponse({
    status: 200,
    description: 'Highlighted skills retrieved successfully',
    type: [SkillResponseDto],
  })
  async getHighlightedSkills() {
    const skills = await this.getHighlightedSkillsUseCase.execute();
    const data = this.skillMapper.toSkillsDto(skills);

    return {
      data,
      meta: { total: data.length },
    };
  }
}
