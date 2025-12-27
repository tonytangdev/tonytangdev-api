import { Skill } from '../../../domain/entities/skill.entity';

export abstract class SkillRepositoryPort {
  abstract findAll(): Promise<Skill[]>;
  abstract findByCategory(categoryId: string): Promise<Skill[]>;
  abstract findHighlighted(): Promise<Skill[]>;
}
