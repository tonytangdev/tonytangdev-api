import { Injectable } from '@nestjs/common';
import { GetExperiencesUseCase } from '../ports/inbound/get-experiences.use-case';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

@Injectable()
export class GetExperiencesService implements GetExperiencesUseCase {
  constructor(private readonly experienceRepo: ExperienceRepositoryPort) {}

  async execute(): Promise<Experience[]> {
    return this.experienceRepo.findAll();
  }
}
