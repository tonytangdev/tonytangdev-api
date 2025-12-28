import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { LanguageProficiency } from '../../../../../domain/value-objects/language-proficiency.vo';

export class CreateLanguageDto {
  @ApiProperty({ description: 'Language name', example: 'German' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Proficiency level',
    enum: LanguageProficiency,
    example: LanguageProficiency.PROFESSIONAL_WORKING,
  })
  @IsEnum(LanguageProficiency)
  proficiency: LanguageProficiency;

  @ApiProperty({
    description: 'Whether this is a native language',
    example: false,
  })
  @IsBoolean()
  isNative: boolean;

  @ApiProperty({
    description: 'Whether this language is highlighted',
    example: true,
  })
  @IsBoolean()
  isHighlighted: boolean;
}
