import { DegreeType } from '../value-objects/degree-type.vo';
import { EducationStatus } from '../value-objects/education-status.vo';

export interface EducationProps {
  id: string;
  institution: string;
  degreeType: DegreeType;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  achievements: string[];
  location: string;
  status: EducationStatus;
  isHighlighted: boolean;
  order: number;
}

export class Education {
  public readonly id: string;
  public readonly institution: string;
  public readonly degreeType: DegreeType;
  public readonly fieldOfStudy: string;
  public readonly startDate: Date;
  public readonly endDate: Date | null;
  public readonly description: string;
  public readonly achievements: string[];
  public readonly location: string;
  public readonly status: EducationStatus;
  public readonly isHighlighted: boolean;
  public readonly order: number;

  constructor(props: EducationProps) {
    this.id = props.id;
    this.institution = props.institution;
    this.degreeType = props.degreeType;
    this.fieldOfStudy = props.fieldOfStudy;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.description = props.description;
    this.achievements = props.achievements;
    this.location = props.location;
    this.status = props.status;
    this.isHighlighted = props.isHighlighted;
    this.order = props.order;
  }
}
