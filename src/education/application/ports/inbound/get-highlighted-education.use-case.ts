import { Education } from '../../../domain/entities/education.entity';

export abstract class GetHighlightedEducationUseCase {
  abstract execute(): Promise<Education[]>;
}
