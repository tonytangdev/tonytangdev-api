import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  UpdateProjectUseCase,
  UpdateProjectInput,
} from '../ports/inbound/update-project.use-case';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class UpdateProjectService implements UpdateProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    // Find existing project
    const existingProject = await this.projectRepo.findById(input.id);
    if (!existingProject) {
      throw new NotFoundException(`Project with id '${input.id}' not found`);
    }

    // Check for duplicate name (excluding current project)
    const duplicateProject = await this.projectRepo.findByNameExcludingId(
      input.name,
      input.id,
    );
    if (duplicateProject) {
      throw new ConflictException(
        `Project with name '${input.name}' already exists`,
      );
    }

    // Convert dates
    const startDate =
      input.startDate instanceof Date
        ? input.startDate
        : new Date(input.startDate);

    let endDate: Date | null = null;
    if (input.endDate) {
      endDate =
        input.endDate instanceof Date ? input.endDate : new Date(input.endDate);
    }

    // Create updated project (preserve order)
    const updatedProject = new Project({
      id: input.id,
      name: input.name,
      description: input.description,
      startDate,
      endDate,
      technologies: input.technologies,
      repositoryLink: input.repositoryLink ?? null,
      demoLink: input.demoLink ?? null,
      websiteLink: input.websiteLink ?? null,
      achievements: input.achievements ?? [],
      order: existingProject.order,
      isHighlighted: input.isHighlighted,
    });

    return this.projectRepo.update(updatedProject);
  }
}
