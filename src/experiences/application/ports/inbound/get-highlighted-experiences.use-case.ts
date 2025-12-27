import { Experience } from '../../../domain/entities/experience.entity';

export abstract class GetHighlightedExperiencesUseCase {
  abstract execute(): Promise<Experience[]>;
}
