import { Injectable } from '@nestjs/common';
import { Language } from '../../../../../domain/entities/language.entity';
import { LanguageRepositoryPort } from '../../../../../application/ports/outbound/language.repository.port';
import { seedLanguages } from './seed-data';

@Injectable()
export class InMemoryLanguageRepository implements LanguageRepositoryPort {
  private readonly languages: Language[] = seedLanguages;

  async findAll(): Promise<Language[]> {
    return new Promise((resolve) =>
      resolve([...this.languages].sort((a, b) => a.order - b.order)),
    );
  }

  async findHighlighted(): Promise<Language[]> {
    return new Promise((resolve) =>
      resolve(
        this.languages
          .filter((language) => language.isHighlighted)
          .sort((a, b) => a.order - b.order),
      ),
    );
  }

  async findNative(): Promise<Language[]> {
    return new Promise((resolve) =>
      resolve(
        this.languages
          .filter((language) => language.isNative)
          .sort((a, b) => a.order - b.order),
      ),
    );
  }
}
