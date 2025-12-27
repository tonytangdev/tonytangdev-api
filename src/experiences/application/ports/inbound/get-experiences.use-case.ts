import { Experience } from '../../../domain/entities/experience.entity';

export abstract class GetExperiencesUseCase {
  abstract execute(): Promise<Experience[]>;
}
