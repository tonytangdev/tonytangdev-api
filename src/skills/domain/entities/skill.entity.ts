import { ProficiencyLevel } from '../value-objects/proficiency-level.vo';

export interface SkillProps {
  id: string;
  name: string;
  categoryId: string;
  proficiency: ProficiencyLevel;
  yearsOfExperience: number | null;
  order: number;
  isHighlighted: boolean;
}

export class Skill {
  public readonly id: string;
  public readonly name: string;
  public readonly categoryId: string;
  public readonly proficiency: ProficiencyLevel;
  public readonly yearsOfExperience: number | null;
  public readonly order: number;
  public readonly isHighlighted: boolean;

  constructor(props: SkillProps) {
    this.id = props.id;
    this.name = props.name;
    this.categoryId = props.categoryId;
    this.proficiency = props.proficiency;
    this.yearsOfExperience = props.yearsOfExperience;
    this.order = props.order;
    this.isHighlighted = props.isHighlighted;
  }
}
