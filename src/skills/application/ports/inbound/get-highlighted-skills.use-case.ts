import { Skill } from '../../../domain/entities/skill.entity';

export abstract class GetHighlightedSkillsUseCase {
  abstract execute(): Promise<Skill[]>;
}
