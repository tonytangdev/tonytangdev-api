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
}
