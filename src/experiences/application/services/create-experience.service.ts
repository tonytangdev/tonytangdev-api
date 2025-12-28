import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateExperienceInput,
  CreateExperienceUseCase,
} from '../ports/inbound/create-experience.use-case';
import { Experience } from '../../domain/entities/experience.entity';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';

@Injectable()
export class CreateExperienceService implements CreateExperienceUseCase {
  constructor(
    private readonly experienceRepository: ExperienceRepositoryPort,
  ) {}

  async execute(input: CreateExperienceInput): Promise<Experience> {
    await this.checkForDuplicates(input.company, input.title);

    const startDate = this.parseDate(input.startDate);
    const endDate = this.parseEndDate(input.endDate);

    this.validateDates(startDate, endDate);

    const order = await this.getNextOrder();

    const experience = this.buildExperience(input, startDate, endDate, order);

    return this.experienceRepository.create(experience);
  }

  private async checkForDuplicates(
    company: string,
    title: string,
  ): Promise<void> {
    const existing = await this.experienceRepository.findByCompanyAndTitle(
      company,
      title,
    );

    if (existing) {
      throw new ConflictException(
        `Experience at ${company} with title "${title}" already exists`,
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

  private async getNextOrder(): Promise<number> {
    const maxOrder = await this.experienceRepository.getMaxOrder();
    return maxOrder + 1;
  }

  private buildExperience(
    input: CreateExperienceInput,
    startDate: Date,
    endDate: Date | null,
    order: number,
  ): Experience {
    return new Experience({
      id: randomUUID(),
      company: input.company,
      title: input.title,
      startDate,
      endDate,
      description: input.description,
      technologies: input.technologies,
      achievements: input.achievements || [],
      location: input.location,
      isCurrent: endDate === null,
      isHighlighted: false,
      order,
    });
  }
}
