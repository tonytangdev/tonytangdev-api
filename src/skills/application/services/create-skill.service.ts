import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateSkillUseCase,
  CreateSkillInput,
} from '../ports/inbound/create-skill.use-case';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { Skill } from '../../domain/entities/skill.entity';

@Injectable()
export class CreateSkillService implements CreateSkillUseCase {
  constructor(
    private readonly skillRepo: SkillRepositoryPort,
    private readonly categoryRepo: SkillCategoryRepositoryPort,
  ) {}

  async execute(input: CreateSkillInput): Promise<Skill> {
    // Validate category exists
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new BadRequestException(
        `Category with id '${input.categoryId}' not found`,
      );
    }

    // Check for duplicate name
    const existingSkill = await this.skillRepo.findByName(input.name);
    if (existingSkill) {
      throw new ConflictException(
        `Skill with name '${input.name}' already exists`,
      );
    }

    // Auto-increment order
    const maxOrder = await this.skillRepo.getMaxOrder();
    const order = maxOrder + 1;

    // Create skill
    const skill = new Skill({
      id: randomUUID(),
      name: input.name,
      categoryId: input.categoryId,
      proficiency: input.proficiency,
      yearsOfExperience: input.yearsOfExperience ?? null,
      order,
      isHighlighted: input.isHighlighted,
    });

    return this.skillRepo.create(skill);
  }
}
