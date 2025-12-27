import { Injectable } from '@nestjs/common';
import { GetCurrentExperienceUseCase } from '../ports/inbound/get-current-experience.use-case';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

@Injectable()
export class GetCurrentExperienceService implements GetCurrentExperienceUseCase {
  constructor(private readonly experienceRepo: ExperienceRepositoryPort) {}

  async execute(): Promise<Experience | null> {
    return this.experienceRepo.findCurrent();
  }
}
