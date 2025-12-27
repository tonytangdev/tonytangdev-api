export interface SkillCategoryProps {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export class SkillCategory {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly order: number;

  constructor(props: SkillCategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.order = props.order;
  }
}
