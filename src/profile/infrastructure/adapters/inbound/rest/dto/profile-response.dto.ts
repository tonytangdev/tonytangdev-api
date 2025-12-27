import { SocialLinkResponseDto } from './social-link-response.dto';

export class ProfileResponseDto {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  email: string;
  phone: string | null;
  location: string;
  timezone: string;
  availability: string;
  yearsOfExperience: number;
  profilePictureUrl: string | null;
  resumeUrl: string | null;
  socialLinks: SocialLinkResponseDto[];
}
