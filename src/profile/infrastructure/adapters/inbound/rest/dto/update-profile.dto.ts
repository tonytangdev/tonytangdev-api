import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilityStatus } from '../../../../../domain/value-objects/availability-status.vo';
import { SocialPlatform } from '../../../../../domain/value-objects/social-platform.vo';
import { IsIANATimezone } from './validators/is-iana-timezone.validator';

export class UpdateSocialLinkDto {
  @ApiPropertyOptional({
    description: 'Social platform',
    enum: SocialPlatform,
    example: SocialPlatform.GITHUB,
  })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiPropertyOptional({
    description: 'Profile URL',
    example: 'https://github.com/tonytangdev',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'tonytangdev',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name',
    example: 'Tony Tang',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Professional title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Biography (Markdown supported)',
    example:
      '# About Me\n\nPassionate **full-stack developer** with expertise in modern web technologies.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'tony@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1 (555) 123-4567',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'San Francisco, CA',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Timezone (IANA format)',
    example: 'America/Los_Angeles',
  })
  @IsString()
  @IsNotEmpty()
  @IsIANATimezone()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Availability status',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.OPEN_TO_OFFERS,
  })
  @IsEnum(AvailabilityStatus)
  @IsOptional()
  availability?: AvailabilityStatus;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 8,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  profilePictureUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Resume URL',
    example: 'https://example.com/resume.pdf',
    nullable: true,
  })
  @IsUrl()
  @IsOptional()
  resumeUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Social media links',
    type: [UpdateSocialLinkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSocialLinkDto)
  @IsOptional()
  socialLinks?: UpdateSocialLinkDto[];
}
