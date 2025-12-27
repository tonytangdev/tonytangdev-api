import { Project } from '../../../domain/entities/project.entity';

export abstract class GetProjectsUseCase {
  abstract execute(): Promise<Project[]>;
}
