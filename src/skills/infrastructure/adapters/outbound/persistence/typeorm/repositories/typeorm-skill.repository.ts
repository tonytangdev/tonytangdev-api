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

  async create(skill: Skill): Promise<Skill> {
    const orm = this.toOrm(skill);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<Skill | null> {
    const skill = await this.repository.findOne({ where: { name } });
    return skill ? this.toDomain(skill) : null;
  }

  async findById(id: string): Promise<Skill | null> {
    const skill = await this.repository.findOne({ where: { id } });
    return skill ? this.toDomain(skill) : null;
  }

  async getMaxOrder(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('skill')
      .select('MAX(skill.order)', 'max')
      .getRawOne<{ max: number | null }>();
    return result?.max ?? 0;
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

  private toOrm(skill: Skill): SkillOrm {
    const orm = new SkillOrm();
    orm.id = skill.id;
    orm.name = skill.name;
    orm.categoryId = skill.categoryId;
    orm.proficiency = skill.proficiency;
    orm.yearsOfExperience = skill.yearsOfExperience;
    orm.order = skill.order;
    orm.isHighlighted = skill.isHighlighted;
    return orm;
  }
}
