import { Injectable } from '@nestjs/common';
import {
  GetSkillsByCategoryUseCase,
  GetSkillsByCategoryResult,
} from '../ports/inbound/get-skills-by-category.use-case';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';

@Injectable()
export class GetSkillsByCategoryService implements GetSkillsByCategoryUseCase {
  constructor(
    private readonly skillRepo: SkillRepositoryPort,
    private readonly categoryRepo: SkillCategoryRepositoryPort,
  ) {}

  async execute(slug: string): Promise<GetSkillsByCategoryResult | null> {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category) {
      return null;
    }

    const skills = await this.skillRepo.findByCategory(category.id);
    return { category, skills };
  }
}
