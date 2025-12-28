import { Injectable, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateProjectUseCase,
  CreateProjectInput,
} from '../ports/inbound/create-project.use-case';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class CreateProjectService implements CreateProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    // Check for duplicate name
    const existingProject = await this.projectRepo.findByName(input.name);
    if (existingProject) {
      throw new ConflictException(
        `Project with name '${input.name}' already exists`,
      );
    }

    // Auto-increment order
    const maxOrder = await this.projectRepo.getMaxOrder();
    const order = maxOrder + 1;

    // Create project
    const project = new Project({
      id: randomUUID(),
      name: input.name,
      description: input.description,
      startDate:
        input.startDate instanceof Date
          ? input.startDate
          : new Date(input.startDate),
      endDate: input.endDate
        ? input.endDate instanceof Date
          ? input.endDate
          : new Date(input.endDate)
        : null,
      technologies: input.technologies,
      repositoryLink: input.repositoryLink ?? null,
      demoLink: input.demoLink ?? null,
      websiteLink: input.websiteLink ?? null,
      achievements: input.achievements ?? [],
      order,
      isHighlighted: false,
    });

    return this.projectRepo.create(project);
  }
}
