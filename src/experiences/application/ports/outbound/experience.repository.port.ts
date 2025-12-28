import { Experience } from '../../../domain/entities/experience.entity';

export abstract class ExperienceRepositoryPort {
  abstract findAll(): Promise<Experience[]>;
  abstract findHighlighted(): Promise<Experience[]>;
  abstract findCurrent(): Promise<Experience | null>;
  abstract create(experience: Experience): Promise<Experience>;
  abstract findByCompanyAndTitle(
    company: string,
    title: string,
  ): Promise<Experience | null>;
  abstract getMaxOrder(): Promise<number>;
}
