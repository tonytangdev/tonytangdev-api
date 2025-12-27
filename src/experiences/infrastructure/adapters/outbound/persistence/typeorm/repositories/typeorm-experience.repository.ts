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
}
