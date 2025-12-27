import { Skill } from '../../../domain/entities/skill.entity';
import { ProficiencyLevel } from '../../../domain/value-objects/proficiency-level.vo';

export interface UpdateSkillInput {
  id: string;
  name: string;
  categoryId: string;
  proficiency: ProficiencyLevel;
  yearsOfExperience?: number | null;
  isHighlighted: boolean;
}

export abstract class UpdateSkillUseCase {
  abstract execute(input: UpdateSkillInput): Promise<Skill>;
}
