import { Controller, Get, NotFoundException } from '@nestjs/common';
import { GetExperiencesUseCase } from '../../../../application/ports/inbound/get-experiences.use-case';
import { GetHighlightedExperiencesUseCase } from '../../../../application/ports/inbound/get-highlighted-experiences.use-case';
import { GetCurrentExperienceUseCase } from '../../../../application/ports/inbound/get-current-experience.use-case';
import { ExperienceMapper } from '../mappers/experience.mapper';

@Controller('experiences')
export class ExperiencesController {
  constructor(
    private readonly getExperiencesUseCase: GetExperiencesUseCase,
    private readonly getHighlightedExperiencesUseCase: GetHighlightedExperiencesUseCase,
    private readonly getCurrentExperienceUseCase: GetCurrentExperienceUseCase,
    private readonly experienceMapper: ExperienceMapper,
  ) {}

  @Get()
  async getExperiences() {
    const experiences = await this.getExperiencesUseCase.execute();
    const data = this.experienceMapper.toDtoList(experiences);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('highlighted')
  async getHighlightedExperiences() {
    const experiences = await this.getHighlightedExperiencesUseCase.execute();
    const data = this.experienceMapper.toDtoList(experiences);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('current')
  async getCurrentExperience() {
    const experience = await this.getCurrentExperienceUseCase.execute();

    if (!experience) {
      throw new NotFoundException('No current experience found');
    }

    const data = this.experienceMapper.toDto(experience);

    return {
      data,
      meta: {},
    };
  }
}
