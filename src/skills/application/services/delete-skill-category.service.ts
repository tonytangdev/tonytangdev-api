import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DeleteSkillCategoryUseCase,
  DeleteSkillCategoryInput,
} from '../ports/inbound/delete-skill-category.use-case';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';

@Injectable()
export class DeleteSkillCategoryService implements DeleteSkillCategoryUseCase {
  constructor(
    private readonly categoryRepo: SkillCategoryRepositoryPort,
    private readonly skillRepo: SkillRepositoryPort,
  ) {}

  async execute(input: DeleteSkillCategoryInput): Promise<void> {
    const existingCategory = await this.categoryRepo.findById(input.id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with id '${input.id}' not found`);
    }

    const skillsInCategory = await this.skillRepo.findByCategory(input.id);
    if (skillsInCategory.length > 0) {
      throw new BadRequestException(
        `Cannot delete category '${existingCategory.name}' because it has ${skillsInCategory.length} skill(s)`,
      );
    }

    await this.categoryRepo.delete(input.id);
  }
}
