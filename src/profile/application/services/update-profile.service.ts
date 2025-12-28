import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  UpdateProfileUseCase,
  UpdateProfileInput,
} from '../ports/inbound/update-profile.use-case';
import { ProfileRepositoryPort } from '../ports/outbound/profile.repository.port';
import { Profile } from '../../domain/entities/profile.entity';
import { SocialLink } from '../../domain/entities/social-link.entity';

@Injectable()
export class UpdateProfileService implements UpdateProfileUseCase {
  constructor(private readonly profileRepo: ProfileRepositoryPort) {}

  async execute(input: UpdateProfileInput): Promise<Profile> {
    // Fetch existing profile
    const existingProfile = await this.profileRepo.findProfile();
    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    // Validate email format if provided
    if (input.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new BadRequestException('Invalid email format');
      }
    }

    // Merge input with existing profile
    const updatedProfile = new Profile({
      id: existingProfile.id, // Preserve id
      fullName: input.fullName ?? existingProfile.fullName,
      title: input.title ?? existingProfile.title,
      bio: input.bio ?? existingProfile.bio,
      email: input.email ?? existingProfile.email,
      phone: input.phone !== undefined ? input.phone : existingProfile.phone,
      location: input.location ?? existingProfile.location,
      timezone: input.timezone ?? existingProfile.timezone,
      availability: input.availability ?? existingProfile.availability,
      yearsOfExperience:
        input.yearsOfExperience ?? existingProfile.yearsOfExperience,
      profilePictureUrl:
        input.profilePictureUrl !== undefined
          ? input.profilePictureUrl
          : existingProfile.profilePictureUrl,
      resumeUrl:
        input.resumeUrl !== undefined
          ? input.resumeUrl
          : existingProfile.resumeUrl,
      socialLinks: input.socialLinks
        ? input.socialLinks.map(
            (link) =>
              new SocialLink({
                platform: link.platform,
                url: link.url,
                username: link.username,
              }),
          )
        : existingProfile.socialLinks,
    });

    return this.profileRepo.update(updatedProfile);
  }
}
