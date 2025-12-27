import { Project } from '../../../domain/entities/project.entity';

export abstract class GetProjectByIdUseCase {
  abstract execute(id: string): Promise<Project | null>;
}
