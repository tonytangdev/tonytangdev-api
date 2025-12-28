import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExperienceRepositoryPort } from '../../../../../../application/ports/outbound/experience.repository.port';
import { Experience } from '../../../../../../domain/entities/experience.entity';
import { ExperienceOrm } from '../entities/experience.entity.orm';

@Injectable()
export class TypeOrmExperienceRepository extends ExperienceRepositoryPort {
  constructor(
    @InjectRepository(ExperienceOrm)
    private readonly repository: Repository<ExperienceOrm>,
  ) {
    super();
  }

  async findAll(): Promise<Experience[]> {
    const experiences = await this.repository.find({
      order: { order: 'ASC' },
    });
    return experiences.map((exp) => this.toDomain(exp));
  }

  async findHighlighted(): Promise<Experience[]> {
    const experiences = await this.repository.find({
      where: { isHighlighted: true },
      order: { order: 'ASC' },
    });
    return experiences.map((exp) => this.toDomain(exp));
  }

  async findCurrent(): Promise<Experience | null> {
    const experience = await this.repository.findOne({
      where: { isCurrent: true },
    });
    return experience ? this.toDomain(experience) : null;
  }

  async create(experience: Experience): Promise<Experience> {
    const orm = this.toOrm(experience);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findByCompanyAndTitle(
    company: string,
    title: string,
  ): Promise<Experience | null> {
    const experience = await this.repository.findOne({
      where: { company, title },
    });
    return experience ? this.toDomain(experience) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('experience')
      .select('MAX(experience.order)', 'maxOrder')
      .getRawOne<{ maxOrder: number | null }>();
    return result?.maxOrder ?? 0;
  }

  private toDomain(orm: ExperienceOrm): Experience {
    return new Experience({
      id: orm.id,
      company: orm.company,
      title: orm.title,
      startDate: orm.startDate,
      endDate: orm.endDate,
      description: orm.description,
      technologies: orm.technologies,
      achievements: orm.achievements,
      location: orm.location,
      isCurrent: orm.isCurrent,
      isHighlighted: orm.isHighlighted,
      order: orm.order,
    });
  }

  private toOrm(domain: Experience): ExperienceOrm {
    const orm = new ExperienceOrm();
    orm.id = domain.id;
    orm.company = domain.company;
    orm.title = domain.title;
    orm.startDate = domain.startDate;
    orm.endDate = domain.endDate;
    orm.description = domain.description;
    orm.technologies = domain.technologies;
    orm.achievements = domain.achievements;
    orm.location = domain.location;
    orm.isCurrent = domain.isCurrent;
    orm.isHighlighted = domain.isHighlighted;
    orm.order = domain.order;
    return orm;
  }
}
