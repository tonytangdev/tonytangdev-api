import { Experience } from '../../../domain/entities/experience.entity';

export interface CreateExperienceInput {
  company: string;
  title: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  description: string;
  technologies: string[];
  achievements?: string[];
  location: string;
}

export abstract class CreateExperienceUseCase {
  abstract execute(input: CreateExperienceInput): Promise<Experience>;
}
