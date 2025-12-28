import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteProjectUseCase,
  DeleteProjectInput,
} from '../ports/inbound/delete-project.use-case';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';

@Injectable()
export class DeleteProjectService implements DeleteProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(input: DeleteProjectInput): Promise<void> {
    const existingProject = await this.projectRepo.findById(input.id);
    if (!existingProject) {
      throw new NotFoundException(`Project with id '${input.id}' not found`);
    }

    await this.projectRepo.delete(input.id);
  }
}
