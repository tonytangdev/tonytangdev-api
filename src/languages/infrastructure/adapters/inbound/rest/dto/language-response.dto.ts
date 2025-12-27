import { ApiProperty } from '@nestjs/swagger';
import { LanguageProficiency } from '../../../../../domain/value-objects/language-proficiency.vo';

export class LanguageResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Language name', example: 'English' })
  name: string;

  @ApiProperty({
    description: 'Proficiency level',
    enum: [
      'elementary',
      'limited-working',
      'professional-working',
      'full-professional',
      'native',
    ],
  })
  proficiency: LanguageProficiency;

  @ApiProperty({ description: 'Whether this is a native language' })
  isNative: boolean;

  @ApiProperty({ description: 'Whether language is highlighted' })
  isHighlighted: boolean;
}
