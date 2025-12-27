import { Injectable } from '@nestjs/common';
import { GetHighlightedEducationUseCase } from '../ports/inbound/get-highlighted-education.use-case';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';

@Injectable()
export class GetHighlightedEducationService implements GetHighlightedEducationUseCase {
  constructor(private readonly educationRepo: EducationRepositoryPort) {}

  async execute(): Promise<Education[]> {
    return this.educationRepo.findHighlighted();
  }
}
