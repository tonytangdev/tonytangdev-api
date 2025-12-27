import { Injectable } from '@nestjs/common';
import { ExperienceRepositoryPort } from '../../../../../application/ports/outbound/experience.repository.port';
import { Experience } from '../../../../../domain/entities/experience.entity';
import { seedExperiences } from './seed-data';

@Injectable()
export class InMemoryExperienceRepository extends ExperienceRepositoryPort {
  private experiences: Experience[] = [...seedExperiences];

  async findAll(): Promise<Experience[]> {
    return Promise.resolve(
      [...this.experiences].sort((a, b) => a.order - b.order),
    );
  }

  async findHighlighted(): Promise<Experience[]> {
    return Promise.resolve(
      this.experiences
        .filter((exp) => exp.isHighlighted)
        .sort((a, b) => a.order - b.order),
    );
  }

  async findCurrent(): Promise<Experience | null> {
    return Promise.resolve(
      this.experiences.find((exp) => exp.isCurrent) || null,
    );
  }
}
