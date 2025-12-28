import { LanguageProficiency } from '../../../domain/value-objects/language-proficiency.vo';
import { Language } from '../../../domain/entities/language.entity';

export interface CreateLanguageInput {
  name: string;
  proficiency: LanguageProficiency;
  isNative: boolean;
  isHighlighted: boolean;
}

export abstract class CreateLanguageUseCase {
  abstract execute(input: CreateLanguageInput): Promise<Language>;
}
