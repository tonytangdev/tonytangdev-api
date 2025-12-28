import { Project } from '../../../domain/entities/project.entity';

export abstract class ProjectRepositoryPort {
  abstract findAll(): Promise<Project[]>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findByTechnology(technologySlug: string): Promise<Project[]>;
  abstract create(project: Project): Promise<Project>;
  abstract findByName(name: string): Promise<Project | null>;
  abstract getMaxOrder(): Promise<number>;
}
