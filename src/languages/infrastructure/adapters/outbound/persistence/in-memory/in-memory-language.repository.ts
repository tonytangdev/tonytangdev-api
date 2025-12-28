import { Injectable } from '@nestjs/common';
import { Language } from '../../../../../domain/entities/language.entity';
import { LanguageRepositoryPort } from '../../../../../application/ports/outbound/language.repository.port';
import { seedLanguages } from './seed-data';

@Injectable()
export class InMemoryLanguageRepository implements LanguageRepositoryPort {
  private languages: Language[] = [...seedLanguages];

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

  async create(language: Language): Promise<Language> {
    this.languages.push(language);
    return Promise.resolve(language);
  }

  async findByName(name: string): Promise<Language | null> {
    const language = this.languages.find((l) => l.name === name);
    return Promise.resolve(language || null);
  }

  async findById(id: string): Promise<Language | null> {
    const language = this.languages.find((l) => l.id === id);
    return Promise.resolve(language || null);
  }

  async getMaxOrder(): Promise<number> {
    if (this.languages.length === 0) {
      return Promise.resolve(0);
    }
    const maxOrder = Math.max(...this.languages.map((l) => l.order));
    return Promise.resolve(maxOrder);
  }

  async delete(id: string): Promise<void> {
    const index = this.languages.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.languages.splice(index, 1);
    }
    return Promise.resolve();
  }
}
