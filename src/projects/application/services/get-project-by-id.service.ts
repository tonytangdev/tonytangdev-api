import { Injectable } from '@nestjs/common';
import { GetProjectByIdUseCase } from '../ports/inbound/get-project-by-id.use-case';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class GetProjectByIdService implements GetProjectByIdUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(id: string): Promise<Project | null> {
    return this.projectRepo.findById(id);
  }
}
