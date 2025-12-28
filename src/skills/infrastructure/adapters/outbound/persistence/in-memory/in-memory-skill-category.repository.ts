import { Injectable } from '@nestjs/common';
import { SkillCategoryRepositoryPort } from '../../../../../application/ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../../../../domain/entities/skill-category.entity';
import { seedCategories } from './seed-data';

@Injectable()
export class InMemorySkillCategoryRepository extends SkillCategoryRepositoryPort {
  private categories: SkillCategory[] = [...seedCategories];

  async findAll(): Promise<SkillCategory[]> {
    return Promise.resolve(
      [...this.categories].sort((a, b) => a.order - b.order),
    );
  }

  async findBySlug(slug: string): Promise<SkillCategory | null> {
    return Promise.resolve(
      this.categories.find((category) => category.slug === slug) || null,
    );
  }

  async create(category: SkillCategory): Promise<SkillCategory> {
    this.categories.push(category);
    return Promise.resolve(category);
  }

  async findByName(name: string): Promise<SkillCategory | null> {
    const category = this.categories.find((c) => c.name === name);
    return Promise.resolve(category || null);
  }

  async findById(id: string): Promise<SkillCategory | null> {
    const category = this.categories.find((c) => c.id === id);
    return Promise.resolve(category || null);
  }

  async getMaxOrder(): Promise<number> {
    if (this.categories.length === 0) {
      return Promise.resolve(0);
    }
    const maxOrder = Math.max(...this.categories.map((c) => c.order));
    return Promise.resolve(maxOrder);
  }

  async update(category: SkillCategory): Promise<SkillCategory> {
    const index = this.categories.findIndex((c) => c.id === category.id);
    if (index !== -1) {
      this.categories[index] = category;
    }
    return Promise.resolve(category);
  }

  async findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<SkillCategory | null> {
    const category = this.categories.find(
      (c) => c.name === name && c.id !== excludeId,
    );
    return Promise.resolve(category || null);
  }

  async findBySlugExcludingId(
    slug: string,
    excludeId: string,
  ): Promise<SkillCategory | null> {
    const category = this.categories.find(
      (c) => c.slug === slug && c.id !== excludeId,
    );
    return Promise.resolve(category || null);
  }

  async delete(id: string): Promise<void> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
    }
    return Promise.resolve();
  }
}
