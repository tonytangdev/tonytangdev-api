import { Injectable, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateSkillCategoryUseCase,
  CreateSkillCategoryInput,
} from '../ports/inbound/create-skill-category.use-case';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../domain/entities/skill-category.entity';

@Injectable()
export class CreateSkillCategoryService implements CreateSkillCategoryUseCase {
  constructor(private readonly categoryRepo: SkillCategoryRepositoryPort) {}

  async execute(input: CreateSkillCategoryInput): Promise<SkillCategory> {
    // Auto-generate slug from name
    const slug = this.generateSlug(input.name);

    // Check for duplicate name
    const existingByName = await this.categoryRepo.findByName(input.name);
    if (existingByName) {
      throw new ConflictException(
        `Category with name '${input.name}' already exists`,
      );
    }

    // Check for duplicate slug
    const existingBySlug = await this.categoryRepo.findBySlug(slug);
    if (existingBySlug) {
      throw new ConflictException(
        `Category with slug '${slug}' already exists`,
      );
    }

    // Auto-increment order
    const maxOrder = await this.categoryRepo.getMaxOrder();
    const order = maxOrder + 1;

    // Create category
    const category = new SkillCategory({
      id: randomUUID(),
      name: input.name,
      slug,
      order,
    });

    return this.categoryRepo.create(category);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
}
