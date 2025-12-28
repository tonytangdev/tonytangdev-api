import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteSkillUseCase,
  DeleteSkillInput,
} from '../ports/inbound/delete-skill.use-case';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';

@Injectable()
export class DeleteSkillService implements DeleteSkillUseCase {
  constructor(private readonly skillRepo: SkillRepositoryPort) {}

  async execute(input: DeleteSkillInput): Promise<void> {
    const existingSkill = await this.skillRepo.findById(input.id);
    if (!existingSkill) {
      throw new NotFoundException(`Skill with id '${input.id}' not found`);
    }

    await this.skillRepo.delete(input.id);
  }
}
