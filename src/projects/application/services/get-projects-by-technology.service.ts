import { Injectable } from '@nestjs/common';
import { GetProjectsByTechnologyUseCase } from '../ports/inbound/get-projects-by-technology.use-case';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class GetProjectsByTechnologyService implements GetProjectsByTechnologyUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(slug: string): Promise<Project[]> {
    return this.projectRepo.findByTechnology(slug);
  }
}
