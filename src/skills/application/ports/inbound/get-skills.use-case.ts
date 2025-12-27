import { Skill } from '../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../domain/entities/skill-category.entity';

export abstract class GetSkillsUseCase {
  abstract execute(): Promise<Map<SkillCategory, Skill[]>>;
}
