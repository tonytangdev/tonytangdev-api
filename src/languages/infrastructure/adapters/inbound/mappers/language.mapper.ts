import { Injectable } from '@nestjs/common';
import { Language } from '../../../../domain/entities/language.entity';
import { LanguageResponseDto } from '../rest/dto/language-response.dto';

@Injectable()
export class LanguageMapper {
  toDto(language: Language): LanguageResponseDto {
    return {
      id: language.id,
      name: language.name,
      proficiency: language.proficiency,
      isNative: language.isNative,
      isHighlighted: language.isHighlighted,
    };
  }

  toDtoList(languages: Language[]): LanguageResponseDto[] {
    return languages.map((language) => this.toDto(language));
  }
}
