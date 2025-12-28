import { Skill } from '../../../domain/entities/skill.entity';

export abstract class SkillRepositoryPort {
  abstract findAll(): Promise<Skill[]>;
  abstract findByCategory(categoryId: string): Promise<Skill[]>;
  abstract findHighlighted(): Promise<Skill[]>;
  abstract create(skill: Skill): Promise<Skill>;
  abstract findByName(name: string): Promise<Skill | null>;
  abstract findById(id: string): Promise<Skill | null>;
  abstract getMaxOrder(): Promise<number>;
  abstract update(skill: Skill): Promise<Skill>;
  abstract findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<Skill | null>;
  abstract delete(id: string): Promise<void>;
}
