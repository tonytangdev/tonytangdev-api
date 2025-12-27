import { Injectable } from '@nestjs/common';
import { SkillRepositoryPort } from '../../../../../application/ports/outbound/skill.repository.port';
import { Skill } from '../../../../../domain/entities/skill.entity';
import { seedSkills } from './seed-data';

@Injectable()
export class InMemorySkillRepository extends SkillRepositoryPort {
  private skills: Skill[] = [...seedSkills];

  async findAll(): Promise<Skill[]> {
    return Promise.resolve([...this.skills].sort((a, b) => a.order - b.order));
  }

  async findByCategory(categoryId: string): Promise<Skill[]> {
    return Promise.resolve(
      this.skills
        .filter((skill) => skill.categoryId === categoryId)
        .sort((a, b) => a.order - b.order),
    );
  }

  async findHighlighted(): Promise<Skill[]> {
    return Promise.resolve(
      this.skills
        .filter((skill) => skill.isHighlighted)
        .sort((a, b) => a.order - b.order),
    );
  }

  async create(skill: Skill): Promise<Skill> {
    this.skills.push(skill);
    return Promise.resolve(skill);
  }

  async findByName(name: string): Promise<Skill | null> {
    const skill = this.skills.find((s) => s.name === name);
    return Promise.resolve(skill || null);
  }

  async findById(id: string): Promise<Skill | null> {
    const skill = this.skills.find((s) => s.id === id);
    return Promise.resolve(skill || null);
  }

  async getMaxOrder(): Promise<number> {
    if (this.skills.length === 0) {
      return Promise.resolve(0);
    }
    const maxOrder = Math.max(...this.skills.map((s) => s.order));
    return Promise.resolve(maxOrder);
  }

  async update(skill: Skill): Promise<Skill> {
    const index = this.skills.findIndex((s) => s.id === skill.id);
    if (index !== -1) {
      this.skills[index] = skill;
    }
    return Promise.resolve(skill);
  }

  async findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<Skill | null> {
    const skill = this.skills.find(
      (s) => s.name === name && s.id !== excludeId,
    );
    return Promise.resolve(skill || null);
  }
}
