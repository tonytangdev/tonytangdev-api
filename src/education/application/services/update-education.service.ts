import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  UpdateEducationUseCase,
  UpdateEducationInput,
} from '../ports/inbound/update-education.use-case';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';
import { EducationStatus } from '../../domain/value-objects/education-status.vo';

@Injectable()
export class UpdateEducationService implements UpdateEducationUseCase {
  constructor(private readonly educationRepo: EducationRepositoryPort) {}

  async execute(input: UpdateEducationInput): Promise<Education> {
    const existingEducation = await this.verifyEducationExists(input.id);
    await this.checkForDuplicateCompositeKey(input);

    const { startDate, endDate } = this.convertDates(input);
    this.validateStartDate(startDate);
    this.validateDateOrdering(startDate, endDate);
    this.validateStatusEndDateConsistency(input.status, endDate);

    const updatedEducation = this.createUpdatedEducation(
      input,
      startDate,
      endDate,
      existingEducation.order,
    );

    return this.educationRepo.update(updatedEducation);
  }

  private async verifyEducationExists(id: string): Promise<Education> {
    const existingEducation = await this.educationRepo.findById(id);
    if (!existingEducation) {
      throw new NotFoundException(`Education with id '${id}' not found`);
    }
    return existingEducation;
  }

  private async checkForDuplicateCompositeKey(
    input: UpdateEducationInput,
  ): Promise<void> {
    const duplicateEducation =
      await this.educationRepo.findByCompositeKeyExcludingId({
        institution: input.institution,
        degreeType: input.degreeType,
        fieldOfStudy: input.fieldOfStudy,
        excludeId: input.id,
      });

    if (duplicateEducation) {
      throw new ConflictException(
        `Education record with institution '${input.institution}', degree type '${input.degreeType}', and field of study '${input.fieldOfStudy}' already exists`,
      );
    }
  }

  private convertDates(input: UpdateEducationInput): {
    startDate: Date;
    endDate: Date | null;
  } {
    const startDate =
      input.startDate instanceof Date
        ? input.startDate
        : new Date(input.startDate);

    let endDate: Date | null = null;
    if (input.endDate) {
      endDate =
        input.endDate instanceof Date ? input.endDate : new Date(input.endDate);
    }

    return { startDate, endDate };
  }

  private validateStartDate(startDate: Date): void {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (startDate > today) {
      throw new BadRequestException('Start date cannot be in the future');
    }
  }

  private validateDateOrdering(startDate: Date, endDate: Date | null): void {
    if (endDate && startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  private validateStatusEndDateConsistency(
    status: EducationStatus,
    endDate: Date | null,
  ): void {
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
  }

  private createUpdatedEducation(
    input: UpdateEducationInput,
    startDate: Date,
    endDate: Date | null,
    order: number,
  ): Education {
    return new Education({
      id: input.id,
      institution: input.institution,
      degreeType: input.degreeType,
      fieldOfStudy: input.fieldOfStudy,
      startDate,
      endDate,
      description: input.description,
      location: input.location,
      status: input.status,
      achievements: input.achievements ?? [],
      isHighlighted: input.isHighlighted,
      order,
    });
  }
}
