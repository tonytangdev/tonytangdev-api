import { SkillCategory } from '../../../domain/entities/skill-category.entity';

export interface CreateSkillCategoryInput {
  name: string;
}

export abstract class CreateSkillCategoryUseCase {
  abstract execute(input: CreateSkillCategoryInput): Promise<SkillCategory>;
}
