import { Injectable } from '@nestjs/common';
import { GetInProgressEducationUseCase } from '../ports/inbound/get-in-progress-education.use-case';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';

@Injectable()
export class GetInProgressEducationService implements GetInProgressEducationUseCase {
  constructor(private readonly educationRepo: EducationRepositoryPort) {}

  async execute(): Promise<Education[]> {
    return this.educationRepo.findInProgress();
  }
}
