import { Injectable } from '@nestjs/common';
import { GetNativeLanguagesUseCase } from '../ports/inbound/get-native-languages.use-case';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';
import { Language } from '../../domain/entities/language.entity';

@Injectable()
export class GetNativeLanguagesService implements GetNativeLanguagesUseCase {
  constructor(private readonly languageRepository: LanguageRepositoryPort) {}

  async execute(): Promise<Language[]> {
    return this.languageRepository.findNative();
  }
}
