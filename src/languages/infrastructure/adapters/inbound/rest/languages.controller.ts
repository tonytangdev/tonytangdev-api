import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetLanguagesUseCase } from '../../../../application/ports/inbound/get-languages.use-case';
import { GetHighlightedLanguagesUseCase } from '../../../../application/ports/inbound/get-highlighted-languages.use-case';
import { GetNativeLanguagesUseCase } from '../../../../application/ports/inbound/get-native-languages.use-case';
import { LanguageMapper } from '../mappers/language.mapper';
import { LanguageResponseDto } from './dto/language-response.dto';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly getLanguagesUseCase: GetLanguagesUseCase,
    private readonly getHighlightedLanguagesUseCase: GetHighlightedLanguagesUseCase,
    private readonly getNativeLanguagesUseCase: GetNativeLanguagesUseCase,
    private readonly languageMapper: LanguageMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all languages' })
  @ApiResponse({ status: 200, description: 'Languages retrieved successfully', type: [LanguageResponseDto] })
  async getLanguages() {
    const languages = await this.getLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('highlighted')
  @ApiOperation({ summary: 'Get highlighted languages' })
  @ApiResponse({ status: 200, description: 'Highlighted languages retrieved successfully', type: [LanguageResponseDto] })
  async getHighlightedLanguages() {
    const languages = await this.getHighlightedLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Get('native')
  @ApiOperation({ summary: 'Get native languages' })
  @ApiResponse({ status: 200, description: 'Native languages retrieved successfully', type: [LanguageResponseDto] })
  async getNativeLanguages() {
    const languages = await this.getNativeLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }
}
