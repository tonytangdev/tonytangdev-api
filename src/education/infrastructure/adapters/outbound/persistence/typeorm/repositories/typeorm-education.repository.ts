import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationRepositoryPort } from '../../../../../../application/ports/outbound/education.repository.port';
import { Education } from '../../../../../../domain/entities/education.entity';
import { EducationOrm } from '../entities/education.entity.orm';
import { EducationStatus } from '../../../../../../domain/value-objects/education-status.vo';

@Injectable()
export class TypeOrmEducationRepository extends EducationRepositoryPort {
  constructor(
    @InjectRepository(EducationOrm)
    private readonly repository: Repository<EducationOrm>,
  ) {
    super();
  }

  async findAll(): Promise<Education[]> {
    const educations = await this.repository.find({
      order: { order: 'ASC' },
    });
    return educations.map((edu) => this.toDomain(edu));
  }

  async findHighlighted(): Promise<Education[]> {
    const educations = await this.repository.find({
      where: { isHighlighted: true },
      order: { order: 'ASC' },
    });
    return educations.map((edu) => this.toDomain(edu));
  }

  async findInProgress(): Promise<Education[]> {
    const educations = await this.repository.find({
      where: { status: EducationStatus.IN_PROGRESS },
      order: { order: 'ASC' },
    });
    return educations.map((edu) => this.toDomain(edu));
  }

  private toDomain(orm: EducationOrm): Education {
    return new Education({
      id: orm.id,
      institution: orm.institution,
      degreeType: orm.degreeType,
      fieldOfStudy: orm.fieldOfStudy,
      startDate: orm.startDate,
      endDate: orm.endDate,
      description: orm.description,
      achievements: orm.achievements,
      location: orm.location,
      status: orm.status,
      isHighlighted: orm.isHighlighted,
      order: orm.order,
    });
  }
}
