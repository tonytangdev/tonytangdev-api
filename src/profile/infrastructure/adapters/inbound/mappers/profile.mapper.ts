import { Injectable } from '@nestjs/common';
import { Profile } from '../../../../domain/entities/profile.entity';
import { SocialLink } from '../../../../domain/entities/social-link.entity';
import { ProfileResponseDto } from '../rest/dto/profile-response.dto';
import { SocialLinkResponseDto } from '../rest/dto/social-link-response.dto';

@Injectable()
export class ProfileMapper {
  toDto(profile: Profile): ProfileResponseDto {
    return {
      id: profile.id,
      fullName: profile.fullName,
      title: profile.title,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      timezone: profile.timezone,
      availability: profile.availability,
      yearsOfExperience: profile.yearsOfExperience,
      profilePictureUrl: profile.profilePictureUrl,
      resumeUrl: profile.resumeUrl,
      socialLinks: profile.socialLinks.map((link) =>
        this.socialLinkToDto(link),
      ),
    };
  }

  private socialLinkToDto(socialLink: SocialLink): SocialLinkResponseDto {
    return {
      platform: socialLink.platform,
      url: socialLink.url,
      username: socialLink.username,
    };
  }
}
