import { LanguageProficiency } from '../../../../../domain/value-objects/language-proficiency.vo';

export class LanguageResponseDto {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
  isNative: boolean;
  isHighlighted: boolean;
}
