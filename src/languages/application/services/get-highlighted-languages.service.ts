import { Injectable } from '@nestjs/common';
import { GetHighlightedLanguagesUseCase } from '../ports/inbound/get-highlighted-languages.use-case';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';
import { Language } from '../../domain/entities/language.entity';

@Injectable()
export class GetHighlightedLanguagesService implements GetHighlightedLanguagesUseCase {
  constructor(private readonly languageRepository: LanguageRepositoryPort) {}

  async execute(): Promise<Language[]> {
    return this.languageRepository.findHighlighted();
  }
}
