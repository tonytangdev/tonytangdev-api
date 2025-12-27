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

  private toDomain(orm: SkillCategoryOrm): SkillCategory {
    return new SkillCategory({
      id: orm.id,
      name: orm.name,
      slug: orm.slug,
      order: orm.order,
    });
  }
}
