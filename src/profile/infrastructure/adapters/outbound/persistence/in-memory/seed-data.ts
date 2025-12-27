import { Profile } from '../../../../../domain/entities/profile.entity';
import { SocialLink } from '../../../../../domain/entities/social-link.entity';
import { AvailabilityStatus } from '../../../../../domain/value-objects/availability-status.vo';
import { SocialPlatform } from '../../../../../domain/value-objects/social-platform.vo';

export const seedProfile: Profile = new Profile({
  id: '1',
  fullName: 'Tony Tang',
  title: 'Senior Software Engineer',
  bio: 'Passionate full-stack developer with expertise in modern web technologies and cloud architecture. Focused on building scalable, maintainable solutions.',
  email: 'tony@tonytang.dev',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  timezone: 'America/Los_Angeles',
  availability: AvailabilityStatus.OPEN_TO_OFFERS,
  yearsOfExperience: 8,
  profilePictureUrl: 'https://avatars.githubusercontent.com/tonytangdev',
  resumeUrl: 'https://resume.tonytang.dev',
  socialLinks: [
    new SocialLink({
      platform: SocialPlatform.GITHUB,
      url: 'https://github.com/tonytangdev',
      username: 'tonytangdev',
    }),
    new SocialLink({
      platform: SocialPlatform.LINKEDIN,
      url: 'https://linkedin.com/in/tonytangdev',
      username: 'tonytangdev',
    }),
    new SocialLink({
      platform: SocialPlatform.TWITTER,
      url: 'https://twitter.com/tonytangdev',
      username: 'tonytangdev',
    }),
  ],
});
