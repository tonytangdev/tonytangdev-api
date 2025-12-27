import { Injectable } from '@nestjs/common';
import { GetProjectsUseCase } from '../ports/inbound/get-projects.use-case';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class GetProjectsService implements GetProjectsUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(): Promise<Project[]> {
    return this.projectRepo.findAll();
  }
}
