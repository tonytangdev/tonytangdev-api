import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateSocialLinkDto {
  @ApiProperty({
    description: 'Social platform',
    enum: SocialPlatform,
    example: SocialPlatform.GITHUB,
  })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty({
    description: 'Profile URL',
    example: 'https://github.com/tonytangdev',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Username',
    example: 'tonytangdev',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class CreateProfileDto {
  @ApiProperty({
    description: 'Full name',
    example: 'Tony Tang',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Professional title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Biography (Markdown supported)',
    example:
      '# About Me\n\nPassionate **full-stack developer** with expertise in modern web technologies.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  bio: string;

  @ApiProperty({
    description: 'Email address',
    example: 'tony@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1 (555) 123-4567',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    description: 'Location',
    example: 'San Francisco, CA',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Timezone (IANA format)',
    example: 'America/Los_Angeles',
  })
  @IsString()
  @IsNotEmpty()
  @IsIANATimezone()
  timezone: string;

  @ApiProperty({
    description: 'Availability status',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.OPEN_TO_OFFERS,
  })
  @IsEnum(AvailabilityStatus)
  availability: AvailabilityStatus;

  @ApiProperty({
    description: 'Years of experience',
    example: 8,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  yearsOfExperience: number;

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
    type: [CreateSocialLinkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSocialLinkDto)
  @IsOptional()
  socialLinks?: CreateSocialLinkDto[];
}
