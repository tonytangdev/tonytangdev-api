import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteLanguageUseCase,
  DeleteLanguageInput,
} from '../ports/inbound/delete-language.use-case';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';

@Injectable()
export class DeleteLanguageService implements DeleteLanguageUseCase {
  constructor(private readonly languageRepo: LanguageRepositoryPort) {}

  async execute(input: DeleteLanguageInput): Promise<void> {
    const existingLanguage = await this.languageRepo.findById(input.id);
    if (!existingLanguage) {
      throw new NotFoundException(`Language with id '${input.id}' not found`);
    }

    await this.languageRepo.delete(input.id);
  }
}
