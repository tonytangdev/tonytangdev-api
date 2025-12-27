import { Education } from '../../../domain/entities/education.entity';

export abstract class GetInProgressEducationUseCase {
  abstract execute(): Promise<Education[]>;
}
