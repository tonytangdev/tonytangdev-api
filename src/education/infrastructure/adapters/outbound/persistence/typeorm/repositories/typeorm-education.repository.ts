import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationRepositoryPort } from '../../../../../../application/ports/outbound/education.repository.port';
import { Education } from '../../../../../../domain/entities/education.entity';
import { EducationOrm } from '../entities/education.entity.orm';
import { EducationStatus } from '../../../../../../domain/value-objects/education-status.vo';
import { DegreeType } from '../../../../../../domain/value-objects/degree-type.vo';

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

  async create(education: Education): Promise<Education> {
    const orm = this.toOrm(education);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findByCompositeKey(
    institution: string,
    degreeType: DegreeType,
    fieldOfStudy: string,
  ): Promise<Education | null> {
    const orm = await this.repository.findOne({
      where: {
        institution,
        degreeType,
        fieldOfStudy,
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('education')
      .select('MAX(education.order)', 'maxOrder')
      .getRawOne<{ maxOrder: number | null }>();
    return result?.maxOrder ?? 0;
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

  private toOrm(education: Education): EducationOrm {
    const orm = new EducationOrm();
    orm.id = education.id;
    orm.institution = education.institution;
    orm.degreeType = education.degreeType;
    orm.fieldOfStudy = education.fieldOfStudy;
    orm.startDate = education.startDate;
    orm.endDate = education.endDate;
    orm.description = education.description;
    orm.achievements = education.achievements;
    orm.location = education.location;
    orm.status = education.status;
    orm.isHighlighted = education.isHighlighted;
    orm.order = education.order;
    return orm;
  }
}
