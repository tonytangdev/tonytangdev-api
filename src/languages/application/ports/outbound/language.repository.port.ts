import { Language } from '../../../domain/entities/language.entity';

export abstract class LanguageRepositoryPort {
  abstract findAll(): Promise<Language[]>;
  abstract findHighlighted(): Promise<Language[]>;
  abstract findNative(): Promise<Language[]>;
  abstract create(language: Language): Promise<Language>;
  abstract findByName(name: string): Promise<Language | null>;
  abstract getMaxOrder(): Promise<number>;
}
