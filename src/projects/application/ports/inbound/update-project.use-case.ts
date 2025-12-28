import { Project } from '../../../domain/entities/project.entity';

export interface UpdateProjectInput {
  id: string;
  name: string;
  description: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  technologies: string[];
  repositoryLink?: string | null;
  demoLink?: string | null;
  websiteLink?: string | null;
  achievements?: string[];
  isHighlighted: boolean;
}

export abstract class UpdateProjectUseCase {
  abstract execute(input: UpdateProjectInput): Promise<Project>;
}
