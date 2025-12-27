import { Injectable } from '@nestjs/common';
import { SkillCategoryRepositoryPort } from '../../../../../application/ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../../../../domain/entities/skill-category.entity';
import { seedCategories } from './seed-data';

@Injectable()
export class InMemorySkillCategoryRepository extends SkillCategoryRepositoryPort {
  private categories: SkillCategory[] = [...seedCategories];

  async findAll(): Promise<SkillCategory[]> {
    return Promise.resolve(
      [...this.categories].sort((a, b) => a.order - b.order),
    );
  }

  async findBySlug(slug: string): Promise<SkillCategory | null> {
    return Promise.resolve(
      this.categories.find((category) => category.slug === slug) || null,
    );
  }
}
