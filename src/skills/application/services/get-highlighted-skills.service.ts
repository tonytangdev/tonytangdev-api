import { Injectable } from '@nestjs/common';
import { GetHighlightedSkillsUseCase } from '../ports/inbound/get-highlighted-skills.use-case';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { Skill } from '../../domain/entities/skill.entity';

@Injectable()
export class GetHighlightedSkillsService implements GetHighlightedSkillsUseCase {
  constructor(private readonly skillRepo: SkillRepositoryPort) {}

  async execute(): Promise<Skill[]> {
    return this.skillRepo.findHighlighted();
  }
}
