import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteEducationUseCase,
  DeleteEducationInput,
} from '../ports/inbound/delete-education.use-case';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';

@Injectable()
export class DeleteEducationService implements DeleteEducationUseCase {
  constructor(private readonly educationRepo: EducationRepositoryPort) {}

  async execute(input: DeleteEducationInput): Promise<void> {
    const existingEducation = await this.educationRepo.findById(input.id);
    if (!existingEducation) {
      throw new NotFoundException(`Education with id '${input.id}' not found`);
    }

    await this.educationRepo.delete(input.id);
  }
}
