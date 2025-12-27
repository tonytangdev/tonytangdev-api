import { SkillCategory } from '../../../domain/entities/skill-category.entity';

export interface UpdateSkillCategoryInput {
  id: string;
  name: string;
}

export abstract class UpdateSkillCategoryUseCase {
  abstract execute(input: UpdateSkillCategoryInput): Promise<SkillCategory>;
}
