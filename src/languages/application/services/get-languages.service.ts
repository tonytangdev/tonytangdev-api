import { Injectable } from '@nestjs/common';
import { GetLanguagesUseCase } from '../ports/inbound/get-languages.use-case';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';
import { Language } from '../../domain/entities/language.entity';

@Injectable()
export class GetLanguagesService implements GetLanguagesUseCase {
  constructor(private readonly languageRepository: LanguageRepositoryPort) {}

  async execute(): Promise<Language[]> {
    return this.languageRepository.findAll();
  }
}
