import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';
import { GetEducationUseCase } from '../../../../application/ports/inbound/get-education.use-case';
import { GetHighlightedEducationUseCase } from '../../../../application/ports/inbound/get-highlighted-education.use-case';
import { GetInProgressEducationUseCase } from '../../../../application/ports/inbound/get-in-progress-education.use-case';
import { CreateEducationUseCase } from '../../../../application/ports/inbound/create-education.use-case';
import { UpdateEducationUseCase } from '../../../../application/ports/inbound/update-education.use-case';
import { EducationMapper } from '../mappers/education.mapper';
import { EducationResponseDto } from './dto/education-response.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(
    private readonly getEducationUseCase: GetEducationUseCase,
    private readonly getHighlightedEducationUseCase: GetHighlightedEducationUseCase,
    private readonly getInProgressEducationUseCase: GetInProgressEducationUseCase,
    private readonly createEducationUseCase: CreateEducationUseCase,
    private readonly updateEducationUseCase: UpdateEducationUseCase,
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

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new education record' })
  @ApiResponse({
    status: 201,
    description: 'Education record created successfully',
    type: EducationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({
    status: 409,
    description: 'Education record already exists',
  })
  @ApiBody({ type: CreateEducationDto })
  @ApiBearerAuth('api-key')
  async createEducation(@Body() dto: CreateEducationDto) {
    const education = await this.createEducationUseCase.execute(dto);
    const data = this.educationMapper.toDto(education);
    return { data, meta: {} };
  }

  @Put(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Update an education record' })
  @ApiResponse({
    status: 200,
    description: 'Education updated successfully',
    type: EducationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  @ApiResponse({ status: 409, description: 'Composite key already exists' })
  @ApiParam({ name: 'id', description: 'Education ID' })
  @ApiBody({ type: UpdateEducationDto })
  @ApiBearerAuth('api-key')
  async updateEducation(
    @Param('id') id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    const education = await this.updateEducationUseCase.execute({ id, ...dto });
    const data = this.educationMapper.toDto(education);
    return { data, meta: {} };
  }
}
