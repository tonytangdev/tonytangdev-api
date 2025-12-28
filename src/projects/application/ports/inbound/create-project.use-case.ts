import { Project } from '../../../domain/entities/project.entity';

export interface CreateProjectInput {
  name: string;
  description: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  technologies: string[];
  repositoryLink?: string | null;
  demoLink?: string | null;
  websiteLink?: string | null;
  achievements?: string[];
}

export abstract class CreateProjectUseCase {
  abstract execute(input: CreateProjectInput): Promise<Project>;
}
