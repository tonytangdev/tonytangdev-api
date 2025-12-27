import { Injectable } from '@nestjs/common';
import { GetEducationUseCase } from '../ports/inbound/get-education.use-case';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';

@Injectable()
export class GetEducationService implements GetEducationUseCase {
  constructor(private readonly educationRepo: EducationRepositoryPort) {}

  async execute(): Promise<Education[]> {
    return this.educationRepo.findAll();
  }
}
