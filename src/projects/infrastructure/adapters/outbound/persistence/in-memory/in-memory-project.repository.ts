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

  async create(project: Project): Promise<Project> {
    this.projects.push(project);
    return Promise.resolve(project);
  }

  async update(project: Project): Promise<Project> {
    const index = this.projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = project;
    }
    return Promise.resolve(project);
  }

  async findByName(name: string): Promise<Project | null> {
    const project = this.projects.find((p) => p.name === name);
    return Promise.resolve(project || null);
  }

  async findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<Project | null> {
    const project = this.projects.find(
      (p) => p.name === name && p.id !== excludeId,
    );
    return Promise.resolve(project || null);
  }

  async getMaxOrder(): Promise<number> {
    if (this.projects.length === 0) {
      return Promise.resolve(0);
    }
    const maxOrder = Math.max(...this.projects.map((p) => p.order));
    return Promise.resolve(maxOrder);
  }

  async delete(id: string): Promise<void> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
    }
    return Promise.resolve();
  }

  private normalizeForSlug(tech: string): string {
    return tech.toLowerCase().replace(/[.\s]+/g, '-');
  }
}
