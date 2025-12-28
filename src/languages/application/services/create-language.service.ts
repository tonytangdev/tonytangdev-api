import { Injectable, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateLanguageUseCase,
  CreateLanguageInput,
} from '../ports/inbound/create-language.use-case';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';
import { Language } from '../../domain/entities/language.entity';

@Injectable()
export class CreateLanguageService implements CreateLanguageUseCase {
  constructor(private readonly languageRepo: LanguageRepositoryPort) {}

  async execute(input: CreateLanguageInput): Promise<Language> {
    // Check for duplicate name
    const existingLanguage = await this.languageRepo.findByName(input.name);
    if (existingLanguage) {
      throw new ConflictException(
        `Language with name '${input.name}' already exists`,
      );
    }

    // Auto-increment order
    const maxOrder = await this.languageRepo.getMaxOrder();
    const order = maxOrder + 1;

    // Create language
    const language = new Language({
      id: randomUUID(),
      name: input.name,
      proficiency: input.proficiency,
      isNative: input.isNative,
      isHighlighted: input.isHighlighted,
      order,
    });

    return this.languageRepo.create(language);
  }
}
