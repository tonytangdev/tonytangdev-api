import { Controller, Get } from '@nestjs/common';
import { GetLanguagesUseCase } from '../../../../application/ports/inbound/get-languages.use-case';
import { GetHighlightedLanguagesUseCase } from '../../../../application/ports/inbound/get-highlighted-languages.use-case';
import { GetNativeLanguagesUseCase } from '../../../../application/ports/inbound/get-native-languages.use-case';
import { LanguageMapper } from '../mappers/language.mapper';

@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly getLanguagesUseCase: GetLanguagesUseCase,
    private readonly getHighlightedLanguagesUseCase: GetHighlightedLanguagesUseCase,
    private readonly getNativeLanguagesUseCase: GetNativeLanguagesUseCase,
    private readonly languageMapper: LanguageMapper,
  ) {}

  @Get()
  async getLanguages() {
    const languages = await this.getLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('highlighted')
  async getHighlightedLanguages() {
    const languages = await this.getHighlightedLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('native')
  async getNativeLanguages() {
    const languages = await this.getNativeLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }
}
