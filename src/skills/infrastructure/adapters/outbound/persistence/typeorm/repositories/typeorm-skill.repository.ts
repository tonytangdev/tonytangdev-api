import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillRepositoryPort } from '../../../../../../application/ports/outbound/skill.repository.port';
import { Skill } from '../../../../../../domain/entities/skill.entity';
import { SkillOrm } from '../entities/skill.entity.orm';

@Injectable()
export class TypeOrmSkillRepository extends SkillRepositoryPort {
  constructor(
    @InjectRepository(SkillOrm)
    private readonly repository: Repository<SkillOrm>,
  ) {
    super();
  }

  async findAll(): Promise<Skill[]> {
    const skills = await this.repository.find({
      order: { order: 'ASC' },
    });
    return skills.map((skill) => this.toDomain(skill));
  }

  async findByCategory(categoryId: string): Promise<Skill[]> {
    const skills = await this.repository.find({
      where: { categoryId },
      order: { order: 'ASC' },
    });
    return skills.map((skill) => this.toDomain(skill));
  }

  async findHighlighted(): Promise<Skill[]> {
    const skills = await this.repository.find({
      where: { isHighlighted: true },
      order: { order: 'ASC' },
    });
    return skills.map((skill) => this.toDomain(skill));
  }

  private toDomain(orm: SkillOrm): Skill {
    return new Skill({
      id: orm.id,
      name: orm.name,
      categoryId: orm.categoryId,
      proficiency: orm.proficiency,
      yearsOfExperience: orm.yearsOfExperience,
      order: orm.order,
      isHighlighted: orm.isHighlighted,
    });
  }
}
