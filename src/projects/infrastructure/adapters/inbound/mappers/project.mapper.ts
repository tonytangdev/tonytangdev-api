import { Injectable } from '@nestjs/common';
import { Project } from '../../../../domain/entities/project.entity';
import { ProjectResponseDto } from '../rest/dto/project-response.dto';

@Injectable()
export class ProjectMapper {
  toDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : null,
      technologies: project.technologies,
      repositoryLink: project.repositoryLink,
      demoLink: project.demoLink,
      websiteLink: project.websiteLink,
      achievements: project.achievements,
      isHighlighted: project.isHighlighted,
    };
  }

  toDtoList(projects: Project[]): ProjectResponseDto[] {
    return projects.map((p) => this.toDto(p));
  }
}
