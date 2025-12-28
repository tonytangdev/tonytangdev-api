import { Education } from '../../../domain/entities/education.entity';
import { DegreeType } from '../../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../../domain/value-objects/education-status.vo';

export interface CreateEducationInput {
  institution: string;
  degreeType: DegreeType;
  fieldOfStudy: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  description: string;
  location: string;
  status?: EducationStatus;
  achievements?: string[];
}

export abstract class CreateEducationUseCase {
  abstract execute(input: CreateEducationInput): Promise<Education>;
}
