import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateEducationUseCase,
  CreateEducationInput,
} from '../ports/inbound/create-education.use-case';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';
import { EducationStatus } from '../../domain/value-objects/education-status.vo';

@Injectable()
export class CreateEducationService implements CreateEducationUseCase {
  constructor(private readonly educationRepo: EducationRepositoryPort) {}

  async execute(input: CreateEducationInput): Promise<Education> {
    // Check for duplicate (institution + degreeType + fieldOfStudy)
    const existingEducation = await this.educationRepo.findByCompositeKey(
      input.institution,
      input.degreeType,
      input.fieldOfStudy,
    );
    if (existingEducation) {
      throw new ConflictException(
        `Education record with institution '${input.institution}', degree type '${input.degreeType}', and field of study '${input.fieldOfStudy}' already exists`,
      );
    }

    // Convert dates
    const startDate =
      input.startDate instanceof Date
        ? input.startDate
        : new Date(input.startDate);
    const endDate = input.endDate
      ? input.endDate instanceof Date
        ? input.endDate
        : new Date(input.endDate)
      : null;

    // Validate: startDate <= today
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (startDate > today) {
      throw new BadRequestException('Start date cannot be in the future');
    }

    // Validate: startDate < endDate when both present
    if (endDate && startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate status-endDate consistency
    const status = input.status ?? EducationStatus.COMPLETED;
    if (status === EducationStatus.IN_PROGRESS && endDate !== null) {
      throw new BadRequestException(
        'IN_PROGRESS education must have null end date',
      );
    }
    if (
      (status === EducationStatus.COMPLETED ||
        status === EducationStatus.DROPPED) &&
      endDate === null
    ) {
      throw new BadRequestException(
        `${status} education must have an end date`,
      );
    }

    // Auto-increment order
    const maxOrder = await this.educationRepo.getMaxOrder();
    const order = maxOrder + 1;

    // Create education entity
    const education = new Education({
      id: randomUUID(),
      institution: input.institution,
      degreeType: input.degreeType,
      fieldOfStudy: input.fieldOfStudy,
      startDate,
      endDate,
      description: input.description,
      location: input.location,
      status,
      achievements: input.achievements ?? [],
      isHighlighted: false,
      order,
    });

    return this.educationRepo.create(education);
  }
}
