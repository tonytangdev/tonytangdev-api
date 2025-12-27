import { Education } from '../../../domain/entities/education.entity';

export abstract class GetEducationUseCase {
  abstract execute(): Promise<Education[]>;
}
