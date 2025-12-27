import { Project } from '../../../domain/entities/project.entity';

export abstract class GetProjectsByTechnologyUseCase {
  abstract execute(slug: string): Promise<Project[]>;
}
