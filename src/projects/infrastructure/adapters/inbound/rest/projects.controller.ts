import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  NotFoundException,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetProjectsUseCase } from '../../../../application/ports/inbound/get-projects.use-case';
import { GetProjectByIdUseCase } from '../../../../application/ports/inbound/get-project-by-id.use-case';
import { GetProjectsByTechnologyUseCase } from '../../../../application/ports/inbound/get-projects-by-technology.use-case';
import { CreateProjectUseCase } from '../../../../application/ports/inbound/create-project.use-case';
import { UpdateProjectUseCase } from '../../../../application/ports/inbound/update-project.use-case';
import { DeleteProjectUseCase } from '../../../../application/ports/inbound/delete-project.use-case';
import { ProjectMapper } from '../mappers/project.mapper';
import { ProjectResponseDto } from './dto/project-response.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly getProjectsUseCase: GetProjectsUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly getProjectsByTechnologyUseCase: GetProjectsByTechnologyUseCase,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly projectMapper: ProjectMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [ProjectResponseDto],
  })
  async getProjects() {
    const projects = await this.getProjectsUseCase.execute();
    const data = this.projectMapper.toDtoList(projects);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 409, description: 'Project name already exists' })
  @ApiBody({ type: CreateProjectDto })
  @ApiBearerAuth('api-key')
  async createProject(@Body() dto: CreateProjectDto) {
    const project = await this.createProjectUseCase.execute(dto);
    const data = this.projectMapper.toDto(project);
    return { data, meta: {} };
  }

  @Put(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Update an existing project' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 409, description: 'Project name already exists' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiBearerAuth('api-key')
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.updateProjectUseCase.execute({ id, ...dto });
    const data = this.projectMapper.toDto(project);
    return { data, meta: {} };
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBearerAuth('api-key')
  async deleteProject(@Param('id') id: string) {
    await this.deleteProjectUseCase.execute({ id });
    return { data: null, meta: {} };
  }

  @Get('technologies/:slug')
  @ApiOperation({ summary: 'Get projects by technology slug' })
  @ApiParam({ name: 'slug', description: 'Technology slug' })
  @ApiResponse({
    status: 200,
    description: 'Projects for technology retrieved successfully',
    type: [ProjectResponseDto],
  })
  async getProjectsByTechnology(@Param('slug') slug: string) {
    const projects = await this.getProjectsByTechnologyUseCase.execute(slug);
    const data = this.projectMapper.toDtoList(projects);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async getProjectById(@Param('id') id: string) {
    const project = await this.getProjectByIdUseCase.execute(id);

    if (!project) {
      throw new NotFoundException(`Project with id '${id}' not found`);
    }

    const data = this.projectMapper.toDto(project);

    return {
      data,
      meta: {},
    };
  }
}
