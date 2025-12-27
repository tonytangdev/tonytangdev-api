import { Skill } from '../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../domain/entities/skill-category.entity';

export interface GetSkillsByCategoryResult {
  category: SkillCategory;
  skills: Skill[];
}

export abstract class GetSkillsByCategoryUseCase {
  abstract execute(slug: string): Promise<GetSkillsByCategoryResult | null>;
}
