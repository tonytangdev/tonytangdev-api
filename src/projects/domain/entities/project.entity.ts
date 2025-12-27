export interface ProjectProps {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  technologies: string[];
  repositoryLink: string | null;
  demoLink: string | null;
  websiteLink: string | null;
  achievements: string[];
  order: number;
  isHighlighted: boolean;
}

export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly startDate: Date;
  public readonly endDate: Date | null;
  public readonly technologies: string[];
  public readonly repositoryLink: string | null;
  public readonly demoLink: string | null;
  public readonly websiteLink: string | null;
  public readonly achievements: string[];
  public readonly order: number;
  public readonly isHighlighted: boolean;

  constructor(props: ProjectProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.technologies = props.technologies;
    this.repositoryLink = props.repositoryLink;
    this.demoLink = props.demoLink;
    this.websiteLink = props.websiteLink;
    this.achievements = props.achievements;
    this.order = props.order;
    this.isHighlighted = props.isHighlighted;
  }
}
