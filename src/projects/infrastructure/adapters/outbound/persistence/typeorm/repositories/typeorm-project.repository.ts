import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRepositoryPort } from '../../../../../../application/ports/outbound/project.repository.port';
import { Project } from '../../../../../../domain/entities/project.entity';
import { ProjectOrm } from '../entities/project.entity.orm';

@Injectable()
export class TypeOrmProjectRepository extends ProjectRepositoryPort {
  constructor(
    @InjectRepository(ProjectOrm)
    private readonly repository: Repository<ProjectOrm>,
  ) {
    super();
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.repository.find({
      order: { order: 'ASC' },
    });
    return projects.map((proj) => this.toDomain(proj));
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.repository.findOne({
      where: { id },
    });
    return project ? this.toDomain(project) : null;
  }

  async findByTechnology(technologySlug: string): Promise<Project[]> {
    const projects = await this.repository
      .createQueryBuilder('project')
      .where(":tech = ANY(string_to_array(project.technologies, ','))", {
        tech: technologySlug,
      })
      .orderBy('project.order', 'ASC')
      .getMany();
    return projects.map((proj) => this.toDomain(proj));
  }

  private toDomain(orm: ProjectOrm): Project {
    return new Project({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      startDate: orm.startDate,
      endDate: orm.endDate,
      technologies: orm.technologies,
      repositoryLink: orm.repositoryLink,
      demoLink: orm.demoLink,
      websiteLink: orm.websiteLink,
      achievements: orm.achievements,
      order: orm.order,
      isHighlighted: orm.isHighlighted,
    });
  }
}
