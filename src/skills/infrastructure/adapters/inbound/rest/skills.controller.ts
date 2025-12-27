import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetSkillsUseCase } from '../../../../application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from '../../../../application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from '../../../../application/ports/inbound/get-highlighted-skills.use-case';
import { CreateSkillUseCase } from '../../../../application/ports/inbound/create-skill.use-case';
import { CreateSkillCategoryUseCase } from '../../../../application/ports/inbound/create-skill-category.use-case';
import { SkillMapper } from '../mappers/skill.mapper';
import { SkillCategoryResponseDto } from './dto/skill-category-response.dto';
import { SkillResponseDto } from './dto/skill-response.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly getSkillsUseCase: GetSkillsUseCase,
    private readonly getSkillsByCategoryUseCase: GetSkillsByCategoryUseCase,
    private readonly getHighlightedSkillsUseCase: GetHighlightedSkillsUseCase,
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly createSkillCategoryUseCase: CreateSkillCategoryUseCase,
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

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({
    status: 201,
    description: 'Skill created successfully',
    type: SkillResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 409, description: 'Skill name already exists' })
  @ApiBody({ type: CreateSkillDto })
  @ApiBearerAuth('api-key')
  async createSkill(@Body() dto: CreateSkillDto) {
    const skill = await this.createSkillUseCase.execute(dto);
    const data = this.skillMapper.toSkillDto(skill);
    return { data, meta: {} };
  }

  @Post('categories')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new skill category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: SkillCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({
    status: 409,
    description: 'Category name/slug already exists',
  })
  @ApiBody({ type: CreateSkillCategoryDto })
  @ApiBearerAuth('api-key')
  async createCategory(@Body() dto: CreateSkillCategoryDto) {
    const category = await this.createSkillCategoryUseCase.execute(dto);
    const data = this.skillMapper.toCategoryWithSkillsDto(category, []);
    return { data, meta: {} };
  }
}
