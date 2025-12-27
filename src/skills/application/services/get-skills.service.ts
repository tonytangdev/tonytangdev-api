import { Injectable } from '@nestjs/common';
import { GetSkillsUseCase } from '../ports/inbound/get-skills.use-case';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillGroupingService } from '../../domain/services/skill-grouping.service';
import { Skill } from '../../domain/entities/skill.entity';
import { SkillCategory } from '../../domain/entities/skill-category.entity';

@Injectable()
export class GetSkillsService implements GetSkillsUseCase {
  constructor(
    private readonly skillRepo: SkillRepositoryPort,
    private readonly categoryRepo: SkillCategoryRepositoryPort,
    private readonly groupingService: SkillGroupingService,
  ) {}

  async execute(): Promise<Map<SkillCategory, Skill[]>> {
    const categories = await this.categoryRepo.findAll();
    const skills = await this.skillRepo.findAll();
    return this.groupingService.groupByCategory(categories, skills);
  }
}
