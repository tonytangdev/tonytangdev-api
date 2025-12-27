import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialLinkResponseDto } from './social-link-response.dto';

export class ProfileResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Full name', example: 'Tony Tang' })
  fullName: string;

  @ApiProperty({
    description: 'Professional title',
    example: 'Senior Software Engineer',
  })
  title: string;

  @ApiProperty({ description: 'Biography' })
  bio: string;

  @ApiProperty({ description: 'Email address', example: 'tony@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'Phone number', nullable: true })
  phone: string | null;

  @ApiProperty({ description: 'Location', example: 'San Francisco, CA' })
  location: string;

  @ApiProperty({ description: 'Timezone', example: 'America/Los_Angeles' })
  timezone: string;

  @ApiProperty({
    description: 'Availability status',
    example: 'Open to opportunities',
  })
  availability: string;

  @ApiProperty({ description: 'Years of experience', example: 8 })
  yearsOfExperience: number;

  @ApiPropertyOptional({ description: 'Profile picture URL', nullable: true })
  profilePictureUrl: string | null;

  @ApiPropertyOptional({ description: 'Resume URL', nullable: true })
  resumeUrl: string | null;

  @ApiProperty({
    description: 'Social media links',
    type: [SocialLinkResponseDto],
  })
  socialLinks: SocialLinkResponseDto[];
}
