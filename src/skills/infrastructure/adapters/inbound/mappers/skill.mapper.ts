import { Injectable } from '@nestjs/common';
import { Skill } from '../../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../../domain/entities/skill-category.entity';
import { SkillResponseDto } from '../rest/dto/skill-response.dto';
import { SkillCategoryResponseDto } from '../rest/dto/skill-category-response.dto';

@Injectable()
export class SkillMapper {
  toSkillDto(skill: Skill): SkillResponseDto {
    return {
      id: skill.id,
      name: skill.name,
      proficiency: skill.proficiency,
      yearsOfExperience: skill.yearsOfExperience,
      isHighlighted: skill.isHighlighted,
    };
  }

  toSkillsDto(skills: Skill[]): SkillResponseDto[] {
    return skills.map((skill) => this.toSkillDto(skill));
  }

  toGroupedDto(
    grouped: Map<SkillCategory, Skill[]>,
  ): SkillCategoryResponseDto[] {
    const result: SkillCategoryResponseDto[] = [];

    grouped.forEach((skills, category) => {
      result.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        skills: this.toSkillsDto(skills),
      });
    });

    return result;
  }

  toCategoryWithSkillsDto(
    category: SkillCategory,
    skills: Skill[],
  ): SkillCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      skills: this.toSkillsDto(skills),
    };
  }
}
