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

  async findById(id: string): Promise<Experience | null> {
    return Promise.resolve(
      this.experiences.find((exp) => exp.id === id) || null,
    );
  }

  async create(experience: Experience): Promise<Experience> {
    this.experiences.push(experience);
    return Promise.resolve(experience);
  }

  async update(experience: Experience): Promise<Experience> {
    const index = this.experiences.findIndex((exp) => exp.id === experience.id);
    if (index !== -1) {
      this.experiences[index] = experience;
    }
    return Promise.resolve(experience);
  }

  async findByCompanyAndTitle(
    company: string,
    title: string,
  ): Promise<Experience | null> {
    return Promise.resolve(
      this.experiences.find(
        (exp) => exp.company === company && exp.title === title,
      ) || null,
    );
  }

  async findByCompanyAndTitleExcludingId(
    company: string,
    title: string,
    excludeId: string,
  ): Promise<Experience | null> {
    return Promise.resolve(
      this.experiences.find(
        (exp) =>
          exp.company === company &&
          exp.title === title &&
          exp.id !== excludeId,
      ) || null,
    );
  }

  async getMaxOrder(): Promise<number> {
    if (this.experiences.length === 0) {
      return Promise.resolve(0);
    }
    return Promise.resolve(
      Math.max(...this.experiences.map((exp) => exp.order)),
    );
  }
}
