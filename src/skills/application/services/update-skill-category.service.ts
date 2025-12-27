import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  UpdateSkillCategoryUseCase,
  UpdateSkillCategoryInput,
} from '../ports/inbound/update-skill-category.use-case';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../domain/entities/skill-category.entity';

@Injectable()
export class UpdateSkillCategoryService implements UpdateSkillCategoryUseCase {
  constructor(private readonly categoryRepo: SkillCategoryRepositoryPort) {}

  async execute(input: UpdateSkillCategoryInput): Promise<SkillCategory> {
    // Find existing category
    const existingCategory = await this.categoryRepo.findById(input.id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with id '${input.id}' not found`);
    }

    // Generate slug from new name
    const slug = SkillCategory.generateSlug(input.name);

    // Check for duplicate name (excluding current category)
    const duplicateByName = await this.categoryRepo.findByNameExcludingId(
      input.name,
      input.id,
    );
    if (duplicateByName) {
      throw new ConflictException(
        `Category with name '${input.name}' already exists`,
      );
    }

    // Check for duplicate slug (excluding current category)
    const duplicateBySlug = await this.categoryRepo.findBySlugExcludingId(
      slug,
      input.id,
    );
    if (duplicateBySlug) {
      throw new ConflictException(
        `Category with slug '${slug}' already exists`,
      );
    }

    // Create updated category (preserve order)
    const updatedCategory = new SkillCategory({
      id: input.id,
      name: input.name,
      slug,
      order: existingCategory.order,
    });

    return this.categoryRepo.update(updatedCategory);
  }
}
