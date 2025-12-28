import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  UpdateExperienceUseCase,
  UpdateExperienceInput,
} from '../ports/inbound/update-experience.use-case';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

@Injectable()
export class UpdateExperienceService implements UpdateExperienceUseCase {
  constructor(
    private readonly experienceRepository: ExperienceRepositoryPort,
  ) {}

  async execute(input: UpdateExperienceInput): Promise<Experience> {
    const existingExperience = await this.verifyExperienceExists(input.id);
    await this.checkForDuplicate(input);

    const startDate = this.parseDate(input.startDate);
    const endDate = this.parseEndDate(input.endDate);

    this.validateDates(startDate, endDate);

    const updatedExperience = this.buildUpdatedExperience(
      input,
      startDate,
      endDate,
      existingExperience.order,
    );

    return this.experienceRepository.update(updatedExperience);
  }

  private async verifyExperienceExists(id: string): Promise<Experience> {
    const experience = await this.experienceRepository.findById(id);

    if (!experience) {
      throw new NotFoundException(`Experience with id '${id}' not found`);
    }

    return experience;
  }

  private async checkForDuplicate(input: UpdateExperienceInput): Promise<void> {
    const duplicate =
      await this.experienceRepository.findByCompanyAndTitleExcludingId(
        input.company,
        input.title,
        input.id,
      );

    if (duplicate) {
      throw new ConflictException(
        `Experience at ${input.company} with title "${input.title}" already exists`,
      );
    }
  }

  private parseDate(date: string | Date): Date {
    return typeof date === 'string' ? new Date(date) : date;
  }

  private parseEndDate(endDate?: string | Date | null): Date | null {
    if (!endDate) {
      return null;
    }

    return this.parseDate(endDate);
  }

  private validateDates(startDate: Date, endDate: Date | null): void {
    const today = this.getTodayAtMidnight();

    if (startDate > today) {
      throw new BadRequestException('Start date cannot be in the future');
    }

    if (endDate && startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  private getTodayAtMidnight(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private buildUpdatedExperience(
    input: UpdateExperienceInput,
    startDate: Date,
    endDate: Date | null,
    order: number,
  ): Experience {
    return new Experience({
      id: input.id,
      company: input.company,
      title: input.title,
      startDate,
      endDate,
      description: input.description,
      technologies: input.technologies,
      achievements: input.achievements || [],
      location: input.location,
      isCurrent: endDate === null,
      isHighlighted: input.isHighlighted,
      order,
    });
  }
}
