import { Injectable } from '@nestjs/common';
import { EducationRepositoryPort } from '../../../../../application/ports/outbound/education.repository.port';
import { Education } from '../../../../../domain/entities/education.entity';
import { EducationStatus } from '../../../../../domain/value-objects/education-status.vo';
import { DegreeType } from '../../../../../domain/value-objects/degree-type.vo';
import { seedEducations } from './seed-data';

@Injectable()
export class InMemoryEducationRepository extends EducationRepositoryPort {
  private educations: Education[] = [...seedEducations];

  async findAll(): Promise<Education[]> {
    return Promise.resolve(
      [...this.educations].sort((a, b) => a.order - b.order),
    );
  }

  async findHighlighted(): Promise<Education[]> {
    return Promise.resolve(
      this.educations
        .filter((edu) => edu.isHighlighted)
        .sort((a, b) => a.order - b.order),
    );
  }

  async findInProgress(): Promise<Education[]> {
    return Promise.resolve(
      this.educations
        .filter((edu) => edu.status === EducationStatus.IN_PROGRESS)
        .sort((a, b) => a.order - b.order),
    );
  }

  async create(education: Education): Promise<Education> {
    this.educations.push(education);
    return Promise.resolve(education);
  }

  async findByCompositeKey(
    institution: string,
    degreeType: DegreeType,
    fieldOfStudy: string,
  ): Promise<Education | null> {
    const found = this.educations.find(
      (edu) =>
        edu.institution === institution &&
        edu.degreeType === degreeType &&
        edu.fieldOfStudy === fieldOfStudy,
    );
    return Promise.resolve(found || null);
  }

  async getMaxOrder(): Promise<number> {
    if (this.educations.length === 0) {
      return Promise.resolve(0);
    }
    const maxOrder = Math.max(...this.educations.map((edu) => edu.order));
    return Promise.resolve(maxOrder);
  }

  async findById(id: string): Promise<Education | null> {
    const found = this.educations.find((edu) => edu.id === id);
    return Promise.resolve(found || null);
  }

  async findByCompositeKeyExcludingId(params: {
    institution: string;
    degreeType: DegreeType;
    fieldOfStudy: string;
    excludeId: string;
  }): Promise<Education | null> {
    const found = this.educations.find(
      (edu) =>
        edu.institution === params.institution &&
        edu.degreeType === params.degreeType &&
        edu.fieldOfStudy === params.fieldOfStudy &&
        edu.id !== params.excludeId,
    );
    return Promise.resolve(found || null);
  }

  async update(education: Education): Promise<Education> {
    const index = this.educations.findIndex((edu) => edu.id === education.id);
    if (index !== -1) {
      this.educations[index] = education;
    }
    return Promise.resolve(education);
  }
}
