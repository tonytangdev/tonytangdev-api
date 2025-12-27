import { Injectable } from '@nestjs/common';
import { GetHighlightedExperiencesUseCase } from '../ports/inbound/get-highlighted-experiences.use-case';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

@Injectable()
export class GetHighlightedExperiencesService implements GetHighlightedExperiencesUseCase {
  constructor(private readonly experienceRepo: ExperienceRepositoryPort) {}

  async execute(): Promise<Experience[]> {
    return this.experienceRepo.findHighlighted();
  }
}
