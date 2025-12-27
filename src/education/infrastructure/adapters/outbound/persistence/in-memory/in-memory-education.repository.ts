import { Injectable } from '@nestjs/common';
import { EducationRepositoryPort } from '../../../../../application/ports/outbound/education.repository.port';
import { Education } from '../../../../../domain/entities/education.entity';
import { EducationStatus } from '../../../../../domain/value-objects/education-status.vo';
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
}
