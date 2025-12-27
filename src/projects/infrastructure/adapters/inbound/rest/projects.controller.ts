import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetProjectsUseCase } from '../../../../application/ports/inbound/get-projects.use-case';
import { GetProjectByIdUseCase } from '../../../../application/ports/inbound/get-project-by-id.use-case';
import { GetProjectsByTechnologyUseCase } from '../../../../application/ports/inbound/get-projects-by-technology.use-case';
import { ProjectMapper } from '../mappers/project.mapper';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly getProjectsUseCase: GetProjectsUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly getProjectsByTechnologyUseCase: GetProjectsByTechnologyUseCase,
    private readonly projectMapper: ProjectMapper,
  ) {}

  @Get()
  async getProjects() {
    const projects = await this.getProjectsUseCase.execute();
    const data = this.projectMapper.toDtoList(projects);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('technologies/:slug')
  async getProjectsByTechnology(@Param('slug') slug: string) {
    const projects = await this.getProjectsByTechnologyUseCase.execute(slug);
    const data = this.projectMapper.toDtoList(projects);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get(':id')
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
