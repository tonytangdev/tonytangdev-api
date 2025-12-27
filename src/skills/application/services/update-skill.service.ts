import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  UpdateSkillUseCase,
  UpdateSkillInput,
} from '../ports/inbound/update-skill.use-case';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { Skill } from '../../domain/entities/skill.entity';

@Injectable()
export class UpdateSkillService implements UpdateSkillUseCase {
  constructor(
    private readonly skillRepo: SkillRepositoryPort,
    private readonly categoryRepo: SkillCategoryRepositoryPort,
  ) {}

  async execute(input: UpdateSkillInput): Promise<Skill> {
    // Find existing skill
    const existingSkill = await this.skillRepo.findById(input.id);
    if (!existingSkill) {
      throw new NotFoundException(`Skill with id '${input.id}' not found`);
    }

    // Validate category exists
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new BadRequestException(
        `Category with id '${input.categoryId}' not found`,
      );
    }

    // Check for duplicate name (excluding current skill)
    const duplicateSkill = await this.skillRepo.findByNameExcludingId(
      input.name,
      input.id,
    );
    if (duplicateSkill) {
      throw new ConflictException(
        `Skill with name '${input.name}' already exists`,
      );
    }

    // Create updated skill (preserve order)
    const updatedSkill = new Skill({
      id: input.id,
      name: input.name,
      categoryId: input.categoryId,
      proficiency: input.proficiency,
      yearsOfExperience: input.yearsOfExperience ?? null,
      order: existingSkill.order,
      isHighlighted: input.isHighlighted,
    });

    return this.skillRepo.update(updatedSkill);
  }
}
