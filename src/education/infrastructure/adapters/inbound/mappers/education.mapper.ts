import { Injectable } from '@nestjs/common';
import { Education } from '../../../../domain/entities/education.entity';
import { EducationResponseDto } from '../rest/dto/education-response.dto';

@Injectable()
export class EducationMapper {
  toDto(education: Education): EducationResponseDto {
    return {
      id: education.id,
      institution: education.institution,
      degreeType: education.degreeType,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate.toISOString(),
      endDate: education.endDate ? education.endDate.toISOString() : null,
      description: education.description,
      achievements: education.achievements,
      location: education.location,
      status: education.status,
      isHighlighted: education.isHighlighted,
    };
  }

  toDtoList(educations: Education[]): EducationResponseDto[] {
    return educations.map((edu) => this.toDto(edu));
  }
}
