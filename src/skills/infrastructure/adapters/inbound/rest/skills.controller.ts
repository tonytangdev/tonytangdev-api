import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetSkillsUseCase } from '../../../../application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from '../../../../application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from '../../../../application/ports/inbound/get-highlighted-skills.use-case';
import { SkillMapper } from '../mappers/skill.mapper';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly getSkillsUseCase: GetSkillsUseCase,
    private readonly getSkillsByCategoryUseCase: GetSkillsByCategoryUseCase,
    private readonly getHighlightedSkillsUseCase: GetHighlightedSkillsUseCase,
    private readonly skillMapper: SkillMapper,
  ) {}

  @Get()
  async getSkills() {
    const grouped = await this.getSkillsUseCase.execute();
    const data = this.skillMapper.toGroupedDto(grouped);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('categories')
  async getCategories() {
    const grouped = await this.getSkillsUseCase.execute();
    const data = this.skillMapper.toGroupedDto(grouped);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('categories/:slug')
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
  async getHighlightedSkills() {
    const skills = await this.getHighlightedSkillsUseCase.execute();
    const data = this.skillMapper.toSkillsDto(skills);

    return {
      data,
      meta: { total: data.length },
    };
  }
}
