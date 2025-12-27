import { SkillCategory } from '../../../domain/entities/skill-category.entity';

export abstract class SkillCategoryRepositoryPort {
  abstract findAll(): Promise<SkillCategory[]>;
  abstract findBySlug(slug: string): Promise<SkillCategory | null>;
}
