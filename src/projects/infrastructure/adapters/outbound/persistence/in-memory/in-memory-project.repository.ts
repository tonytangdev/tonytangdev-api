import { Injectable } from '@nestjs/common';
import { ProjectRepositoryPort } from '../../../../../application/ports/outbound/project.repository.port';
import { Project } from '../../../../../domain/entities/project.entity';
import { seedProjects } from './seed-data';

@Injectable()
export class InMemoryProjectRepository extends ProjectRepositoryPort {
  private projects: Project[] = [...seedProjects];

  async findAll(): Promise<Project[]> {
    return Promise.resolve(
      [...this.projects].sort((a, b) => a.order - b.order),
    );
  }

  async findById(id: string): Promise<Project | null> {
    return Promise.resolve(this.projects.find((p) => p.id === id) || null);
  }

  async findByTechnology(technologySlug: string): Promise<Project[]> {
    const normalized = this.normalizeForSlug(technologySlug);

    return Promise.resolve(
      this.projects
        .filter((p) =>
          p.technologies.some(
            (tech) => this.normalizeForSlug(tech) === normalized,
          ),
        )
        .sort((a, b) => a.order - b.order),
    );
  }

  private normalizeForSlug(tech: string): string {
    return tech.toLowerCase().replace(/[.\s]+/g, '-');
  }
}
