import { Controller, Get } from '@nestjs/common';
import { GetEducationUseCase } from '../../../../application/ports/inbound/get-education.use-case';
import { GetHighlightedEducationUseCase } from '../../../../application/ports/inbound/get-highlighted-education.use-case';
import { GetInProgressEducationUseCase } from '../../../../application/ports/inbound/get-in-progress-education.use-case';
import { EducationMapper } from '../mappers/education.mapper';

@Controller('education')
export class EducationController {
  constructor(
    private readonly getEducationUseCase: GetEducationUseCase,
    private readonly getHighlightedEducationUseCase: GetHighlightedEducationUseCase,
    private readonly getInProgressEducationUseCase: GetInProgressEducationUseCase,
    private readonly educationMapper: EducationMapper,
  ) {}

  @Get()
  async getEducation() {
    const educations = await this.getEducationUseCase.execute();
    const data = this.educationMapper.toDtoList(educations);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('highlighted')
  async getHighlightedEducation() {
    const educations = await this.getHighlightedEducationUseCase.execute();
    const data = this.educationMapper.toDtoList(educations);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('in-progress')
  async getInProgressEducation() {
    const educations = await this.getInProgressEducationUseCase.execute();
    const data = this.educationMapper.toDtoList(educations);

    return {
      data,
      meta: { total: data.length },
    };
  }
}
