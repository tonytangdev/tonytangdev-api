export interface ExperienceProps {
  id: string;
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  technologies: string[];
  achievements: string[];
  location: string;
  isCurrent: boolean;
  isHighlighted: boolean;
  order: number;
}

export class Experience {
  public readonly id: string;
  public readonly company: string;
  public readonly title: string;
  public readonly startDate: Date;
  public readonly endDate: Date | null;
  public readonly description: string;
  public readonly technologies: string[];
  public readonly achievements: string[];
  public readonly location: string;
  public readonly isCurrent: boolean;
  public readonly isHighlighted: boolean;
  public readonly order: number;

  constructor(props: ExperienceProps) {
    this.id = props.id;
    this.company = props.company;
    this.title = props.title;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.description = props.description;
    this.technologies = props.technologies;
    this.achievements = props.achievements;
    this.location = props.location;
    this.isCurrent = props.isCurrent;
    this.isHighlighted = props.isHighlighted;
    this.order = props.order;
  }
}
