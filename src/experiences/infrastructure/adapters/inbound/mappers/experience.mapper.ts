import { Injectable } from '@nestjs/common';
import { Experience } from '../../../../domain/entities/experience.entity';
import { ExperienceResponseDto } from '../rest/dto/experience-response.dto';

@Injectable()
export class ExperienceMapper {
  toDto(experience: Experience): ExperienceResponseDto {
    return {
      id: experience.id,
      company: experience.company,
      title: experience.title,
      startDate: experience.startDate.toISOString(),
      endDate: experience.endDate ? experience.endDate.toISOString() : null,
      description: experience.description,
      technologies: experience.technologies,
      achievements: experience.achievements,
      location: experience.location,
      isCurrent: experience.isCurrent,
      isHighlighted: experience.isHighlighted,
    };
  }

  toDtoList(experiences: Experience[]): ExperienceResponseDto[] {
    return experiences.map((exp) => this.toDto(exp));
  }
}
