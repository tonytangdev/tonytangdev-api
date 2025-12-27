import { Education } from '../../../domain/entities/education.entity';

export abstract class EducationRepositoryPort {
  abstract findAll(): Promise<Education[]>;
  abstract findHighlighted(): Promise<Education[]>;
  abstract findInProgress(): Promise<Education[]>;
}
