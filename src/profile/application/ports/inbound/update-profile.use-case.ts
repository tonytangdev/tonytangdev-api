import { Profile } from '../../../domain/entities/profile.entity';
import { AvailabilityStatus } from '../../../domain/value-objects/availability-status.vo';
import { SocialPlatform } from '../../../domain/value-objects/social-platform.vo';

export interface UpdateProfileInput {
  fullName?: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string | null;
  location?: string;
  timezone?: string;
  availability?: AvailabilityStatus;
  yearsOfExperience?: number;
  profilePictureUrl?: string | null;
  resumeUrl?: string | null;
  socialLinks?: Array<{
    platform: SocialPlatform;
    url: string;
    username: string;
  }>;
}

export abstract class UpdateProfileUseCase {
  abstract execute(input: UpdateProfileInput): Promise<Profile>;
}
