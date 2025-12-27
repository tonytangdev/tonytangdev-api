import { Skill } from '../../../domain/entities/skill.entity';
import { ProficiencyLevel } from '../../../domain/value-objects/proficiency-level.vo';

export interface CreateSkillInput {
  name: string;
  categoryId: string;
  proficiency: ProficiencyLevel;
  yearsOfExperience?: number | null;
  isHighlighted: boolean;
}

export abstract class CreateSkillUseCase {
  abstract execute(input: CreateSkillInput): Promise<Skill>;
}
