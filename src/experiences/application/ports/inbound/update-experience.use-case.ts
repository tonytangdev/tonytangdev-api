import { Experience } from '../../../domain/entities/experience.entity';

export interface UpdateExperienceInput {
  id: string;
  company: string;
  title: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  description: string;
  technologies: string[];
  achievements?: string[];
  location: string;
  isHighlighted: boolean;
}

export abstract class UpdateExperienceUseCase {
  abstract execute(input: UpdateExperienceInput): Promise<Experience>;
}
