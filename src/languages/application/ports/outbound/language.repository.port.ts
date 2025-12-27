import { Language } from '../../../domain/entities/language.entity';

export abstract class LanguageRepositoryPort {
  abstract findAll(): Promise<Language[]>;
  abstract findHighlighted(): Promise<Language[]>;
  abstract findNative(): Promise<Language[]>;
}
