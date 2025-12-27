import { ProficiencyLevel } from '../../../../../domain/value-objects/proficiency-level.vo';

export class SkillResponseDto {
  id: string;
  name: string;
  proficiency: ProficiencyLevel;
  yearsOfExperience: number | null;
  isHighlighted: boolean;
}
