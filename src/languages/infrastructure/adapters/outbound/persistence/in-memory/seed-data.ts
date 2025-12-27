import { Language } from '../../../../../domain/entities/language.entity';
import { LanguageProficiency } from '../../../../../domain/value-objects/language-proficiency.vo';

export const seedLanguages: Language[] = [
  new Language({
    id: '1',
    name: 'English',
    proficiency: LanguageProficiency.NATIVE,
    isNative: true,
    isHighlighted: true,
    order: 0,
  }),
  new Language({
    id: '2',
    name: 'French',
    proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
    isNative: false,
    isHighlighted: true,
    order: 1,
  }),
  new Language({
    id: '3',
    name: 'Spanish',
    proficiency: LanguageProficiency.LIMITED_WORKING,
    isNative: false,
    isHighlighted: false,
    order: 2,
  }),
];
