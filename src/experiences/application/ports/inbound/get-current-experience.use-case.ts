import { Experience } from '../../../domain/entities/experience.entity';

export abstract class GetCurrentExperienceUseCase {
  abstract execute(): Promise<Experience | null>;
}
