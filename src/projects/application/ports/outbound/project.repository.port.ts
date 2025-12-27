import { Project } from '../../../domain/entities/project.entity';

export abstract class ProjectRepositoryPort {
  abstract findAll(): Promise<Project[]>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findByTechnology(technologySlug: string): Promise<Project[]>;
}
