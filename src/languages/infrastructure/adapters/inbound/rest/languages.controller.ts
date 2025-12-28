import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetLanguagesUseCase } from '../../../../application/ports/inbound/get-languages.use-case';
import { GetHighlightedLanguagesUseCase } from '../../../../application/ports/inbound/get-highlighted-languages.use-case';
import { GetNativeLanguagesUseCase } from '../../../../application/ports/inbound/get-native-languages.use-case';
import { CreateLanguageUseCase } from '../../../../application/ports/inbound/create-language.use-case';
import { DeleteLanguageUseCase } from '../../../../application/ports/inbound/delete-language.use-case';
import { LanguageMapper } from '../mappers/language.mapper';
import { LanguageResponseDto } from './dto/language-response.dto';
import { CreateLanguageDto } from './dto/create-language.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly getLanguagesUseCase: GetLanguagesUseCase,
    private readonly getHighlightedLanguagesUseCase: GetHighlightedLanguagesUseCase,
    private readonly getNativeLanguagesUseCase: GetNativeLanguagesUseCase,
    private readonly createLanguageUseCase: CreateLanguageUseCase,
    private readonly deleteLanguageUseCase: DeleteLanguageUseCase,
    private readonly languageMapper: LanguageMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all languages' })
  @ApiResponse({
    status: 200,
    description: 'Languages retrieved successfully',
    type: [LanguageResponseDto],
  })
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
  @ApiResponse({
    status: 200,
    description: 'Highlighted languages retrieved successfully',
    type: [LanguageResponseDto],
  })
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
  @ApiResponse({
    status: 200,
    description: 'Native languages retrieved successfully',
    type: [LanguageResponseDto],
  })
  async getNativeLanguages() {
    const languages = await this.getNativeLanguagesUseCase.execute();
    const data = this.languageMapper.toDtoList(languages);

    return {
      data,
      meta: { total: data.length },
    };
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new language' })
  @ApiResponse({
    status: 201,
    description: 'Language created successfully',
    type: LanguageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 409, description: 'Language name already exists' })
  @ApiBody({ type: CreateLanguageDto })
  @ApiBearerAuth('api-key')
  async createLanguage(@Body() dto: CreateLanguageDto) {
    const language = await this.createLanguageUseCase.execute(dto);
    const data = this.languageMapper.toDto(language);
    return { data, meta: {} };
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Delete a language' })
  @ApiResponse({ status: 200, description: 'Language deleted successfully' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Language not found' })
  @ApiParam({ name: 'id', description: 'Language ID' })
  @ApiBearerAuth('api-key')
  async deleteLanguage(@Param('id') id: string) {
    await this.deleteLanguageUseCase.execute({ id });
    return { data: null, meta: {} };
  }
}
