import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteExperienceInput,
  DeleteExperienceUseCase,
} from '../ports/inbound/delete-experience.use-case';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';

@Injectable()
export class DeleteExperienceService implements DeleteExperienceUseCase {
  constructor(private readonly experienceRepo: ExperienceRepositoryPort) {}

  async execute(input: DeleteExperienceInput): Promise<void> {
    const existingExperience = await this.experienceRepo.findById(input.id);
    if (!existingExperience) {
      throw new NotFoundException(`Experience with id '${input.id}' not found`);
    }

    await this.experienceRepo.delete(input.id);
  }
}
