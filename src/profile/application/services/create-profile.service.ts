import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateProfileUseCase,
  CreateProfileInput,
} from '../ports/inbound/create-profile.use-case';
import { ProfileRepositoryPort } from '../ports/outbound/profile.repository.port';
import { Profile } from '../../domain/entities/profile.entity';
import { SocialLink } from '../../domain/entities/social-link.entity';

@Injectable()
export class CreateProfileService implements CreateProfileUseCase {
  constructor(private readonly profileRepo: ProfileRepositoryPort) {}

  async execute(input: CreateProfileInput): Promise<Profile> {
    // Check if profile already exists
    const existingProfile = await this.profileRepo.findProfile();
    if (existingProfile) {
      throw new ConflictException('Profile already exists');
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Create profile entity
    const profile = new Profile({
      id: randomUUID(),
      fullName: input.fullName,
      title: input.title,
      bio: input.bio,
      email: input.email,
      phone: input.phone ?? null,
      location: input.location,
      timezone: input.timezone,
      availability: input.availability,
      yearsOfExperience: input.yearsOfExperience,
      profilePictureUrl: input.profilePictureUrl ?? null,
      resumeUrl: input.resumeUrl ?? null,
      socialLinks: (input.socialLinks ?? []).map(
        (link) =>
          new SocialLink({
            platform: link.platform,
            url: link.url,
            username: link.username,
          }),
      ),
    });

    return this.profileRepo.create(profile);
  }
}
