import { SkillResponseDto } from './skill-response.dto';

export class SkillCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  skills: SkillResponseDto[];
}
