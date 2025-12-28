import { SkillCategory } from '../../../domain/entities/skill-category.entity';

export abstract class SkillCategoryRepositoryPort {
  abstract findAll(): Promise<SkillCategory[]>;
  abstract findBySlug(slug: string): Promise<SkillCategory | null>;
  abstract create(category: SkillCategory): Promise<SkillCategory>;
  abstract findByName(name: string): Promise<SkillCategory | null>;
  abstract findById(id: string): Promise<SkillCategory | null>;
  abstract getMaxOrder(): Promise<number>;
  abstract update(category: SkillCategory): Promise<SkillCategory>;
  abstract findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<SkillCategory | null>;
  abstract findBySlugExcludingId(
    slug: string,
    excludeId: string,
  ): Promise<SkillCategory | null>;
  abstract delete(id: string): Promise<void>;
}
