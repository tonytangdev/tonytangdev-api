import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetEducationUseCase } from '../../../../application/ports/inbound/get-education.use-case';
import { GetHighlightedEducationUseCase } from '../../../../application/ports/inbound/get-highlighted-education.use-case';
import { GetInProgressEducationUseCase } from '../../../../application/ports/inbound/get-in-progress-education.use-case';
import { EducationMapper } from '../mappers/education.mapper';
import { EducationResponseDto } from './dto/education-response.dto';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(
    private readonly getEducationUseCase: GetEducationUseCase,
    private readonly getHighlightedEducationUseCase: GetHighlightedEducationUseCase,
    private readonly getInProgressEducationUseCase: GetInProgressEducationUseCase,
    private readonly educationMapper: EducationMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all education records' })
  @ApiResponse({
    status: 200,
    description: 'Education records retrieved successfully',
    type: [EducationResponseDto],
  })
  async getEducation() {
    const educations = await this.getEducationUseCase.execute();
    const data = this.educationMapper.toDtoList(educations);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('highlighted')
  @ApiOperation({ summary: 'Get highlighted education records' })
  @ApiResponse({
    status: 200,
    description: 'Highlighted education records retrieved successfully',
    type: [EducationResponseDto],
  })
  async getHighlightedEducation() {
    const educations = await this.getHighlightedEducationUseCase.execute();
    const data = this.educationMapper.toDtoList(educations);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('in-progress')
  @ApiOperation({ summary: 'Get ongoing education records' })
  @ApiResponse({
    status: 200,
    description: 'In-progress education records retrieved successfully',
    type: [EducationResponseDto],
  })
  async getInProgressEducation() {
    const educations = await this.getInProgressEducationUseCase.execute();
    const data = this.educationMapper.toDtoList(educations);

    return {
      data,
      meta: { total: data.length },
    };
  }
}
