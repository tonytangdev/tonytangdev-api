import { ProficiencyLevel } from '../value-objects/proficiency-level.vo';

export class Skill {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly categoryId: string,
    public readonly proficiency: ProficiencyLevel,
    public readonly yearsOfExperience: number | null,
    public readonly order: number,
    public readonly isHighlighted: boolean,
  ) {}
}
