import { Education } from '../../../domain/entities/education.entity';
import { DegreeType } from '../../../domain/value-objects/degree-type.vo';

export abstract class EducationRepositoryPort {
  abstract findAll(): Promise<Education[]>;
  abstract findHighlighted(): Promise<Education[]>;
  abstract findInProgress(): Promise<Education[]>;
  abstract create(education: Education): Promise<Education>;
  abstract findByCompositeKey(
    institution: string,
    degreeType: DegreeType,
    fieldOfStudy: string,
  ): Promise<Education | null>;
  abstract getMaxOrder(): Promise<number>;
  abstract findById(id: string): Promise<Education | null>;
  abstract findByCompositeKeyExcludingId(params: {
    institution: string;
    degreeType: DegreeType;
    fieldOfStudy: string;
    excludeId: string;
  }): Promise<Education | null>;
  abstract update(education: Education): Promise<Education>;
}
