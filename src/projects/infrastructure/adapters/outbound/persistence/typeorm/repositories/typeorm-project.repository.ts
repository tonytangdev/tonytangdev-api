import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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

  async create(project: Project): Promise<Project> {
    const orm = this.toOrm(project);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async update(project: Project): Promise<Project> {
    const orm = this.toOrm(project);
    await this.repository.save(orm);
    return project;
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.repository.findOne({ where: { name } });
    return project ? this.toDomain(project) : null;
  }

  async findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<Project | null> {
    const project = await this.repository.findOne({
      where: { name, id: Not(excludeId) },
    });
    return project ? this.toDomain(project) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('project')
      .select('MAX(project.order)', 'max')
      .getRawOne<{ max: number | null }>();
    return result?.max ?? 0;
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

  private toOrm(project: Project): ProjectOrm {
    const orm = new ProjectOrm();
    orm.id = project.id;
    orm.name = project.name;
    orm.description = project.description;
    orm.startDate = project.startDate;
    orm.endDate = project.endDate;
    orm.technologies = project.technologies;
    orm.repositoryLink = project.repositoryLink;
    orm.demoLink = project.demoLink;
    orm.websiteLink = project.websiteLink;
    orm.achievements = project.achievements;
    orm.order = project.order;
    orm.isHighlighted = project.isHighlighted;
    return orm;
  }
}
