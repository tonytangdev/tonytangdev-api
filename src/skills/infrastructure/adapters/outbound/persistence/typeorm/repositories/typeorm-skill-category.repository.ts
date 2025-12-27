import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillCategoryRepositoryPort } from '../../../../../../application/ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../../../../../domain/entities/skill-category.entity';
import { SkillCategoryOrm } from '../entities/skill-category.entity.orm';

@Injectable()
export class TypeOrmSkillCategoryRepository extends SkillCategoryRepositoryPort {
  constructor(
    @InjectRepository(SkillCategoryOrm)
    private readonly repository: Repository<SkillCategoryOrm>,
  ) {
    super();
  }

  async findAll(): Promise<SkillCategory[]> {
    const categories = await this.repository.find({
      order: { order: 'ASC' },
    });
    return categories.map((category) => this.toDomain(category));
  }

  async findBySlug(slug: string): Promise<SkillCategory | null> {
    const category = await this.repository.findOne({ where: { slug } });
    return category ? this.toDomain(category) : null;
  }

  async create(category: SkillCategory): Promise<SkillCategory> {
    const orm = this.toOrm(category);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<SkillCategory | null> {
    const category = await this.repository.findOne({ where: { name } });
    return category ? this.toDomain(category) : null;
  }

  async findById(id: string): Promise<SkillCategory | null> {
    const category = await this.repository.findOne({ where: { id } });
    return category ? this.toDomain(category) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('category')
      .select('MAX(category.order)', 'max')
      .getRawOne<{ max: number | null }>();
    return result?.max ?? 0;
  }

  private toDomain(orm: SkillCategoryOrm): SkillCategory {
    return new SkillCategory({
      id: orm.id,
      name: orm.name,
      slug: orm.slug,
      order: orm.order,
    });
  }

  private toOrm(category: SkillCategory): SkillCategoryOrm {
    const orm = new SkillCategoryOrm();
    orm.id = category.id;
    orm.name = category.name;
    orm.slug = category.slug;
    orm.order = category.order;
    return orm;
  }
}
