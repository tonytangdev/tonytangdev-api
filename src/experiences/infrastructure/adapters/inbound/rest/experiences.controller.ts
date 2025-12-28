import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { GetExperiencesUseCase } from '../../../../application/ports/inbound/get-experiences.use-case';
import { GetHighlightedExperiencesUseCase } from '../../../../application/ports/inbound/get-highlighted-experiences.use-case';
import { GetCurrentExperienceUseCase } from '../../../../application/ports/inbound/get-current-experience.use-case';
import { CreateExperienceUseCase } from '../../../../application/ports/inbound/create-experience.use-case';
import { ExperienceMapper } from '../mappers/experience.mapper';
import { ExperienceResponseDto } from './dto/experience-response.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(
    private readonly getExperiencesUseCase: GetExperiencesUseCase,
    private readonly getHighlightedExperiencesUseCase: GetHighlightedExperiencesUseCase,
    private readonly getCurrentExperienceUseCase: GetCurrentExperienceUseCase,
    private readonly createExperienceUseCase: CreateExperienceUseCase,
    private readonly experienceMapper: ExperienceMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all work experiences' })
  @ApiResponse({
    status: 200,
    description: 'Experiences retrieved successfully',
    type: [ExperienceResponseDto],
  })
  async getExperiences() {
    const experiences = await this.getExperiencesUseCase.execute();
    const data = this.experienceMapper.toDtoList(experiences);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('highlighted')
  @ApiOperation({ summary: 'Get highlighted experiences' })
  @ApiResponse({
    status: 200,
    description: 'Highlighted experiences retrieved successfully',
    type: [ExperienceResponseDto],
  })
  async getHighlightedExperiences() {
    const experiences = await this.getHighlightedExperiencesUseCase.execute();
    const data = this.experienceMapper.toDtoList(experiences);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current work experience' })
  @ApiResponse({
    status: 200,
    description: 'Current experience retrieved successfully',
    type: ExperienceResponseDto,
  })
  @ApiNotFoundResponse({ description: 'No current experience found' })
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

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new work experience' })
  @ApiResponse({
    status: 201,
    description: 'Experience created successfully',
    type: ExperienceResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiConflictResponse({ description: 'Experience already exists' })
  async createExperience(@Body() dto: CreateExperienceDto) {
    const experience = await this.createExperienceUseCase.execute(dto);
    const data = this.experienceMapper.toDto(experience);

    return {
      data,
      meta: {},
    };
  }
}
