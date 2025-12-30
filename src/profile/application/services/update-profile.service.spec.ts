import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateProfileService } from './update-profile.service';
import { ProfileRepositoryPort } from '../ports/outbound/profile.repository.port';
import { Profile } from '../../domain/entities/profile.entity';
import { SocialLink } from '../../domain/entities/social-link.entity';
import { AvailabilityStatus } from '../../domain/value-objects/availability-status.vo';
import { SocialPlatform } from '../../domain/value-objects/social-platform.vo';
import { MarkdownService } from '../../../common/services/markdown.service';

describe('UpdateProfileService', () => {
  let service: UpdateProfileService;
  let profileRepo: jest.Mocked<ProfileRepositoryPort>;

  const existingProfile = new Profile({
    id: 'profile-1',
    fullName: 'John Doe',
    title: 'Software Engineer',
    bio: 'Experienced developer',
    bioHtml: '<p>Experienced developer</p>\n',
    email: 'john@example.com',
    phone: '+1-555-0000',
    location: 'Boston, MA',
    timezone: 'America/New_York',
    availability: AvailabilityStatus.AVAILABLE,
    yearsOfExperience: 5,
    profilePictureUrl: 'https://example.com/old.jpg',
    resumeUrl: 'https://example.com/old-resume.pdf',
    socialLinks: [
      new SocialLink({
        platform: SocialPlatform.GITHUB,
        url: 'https://github.com/johndoe',
        username: 'johndoe',
      }),
    ],
  });

  beforeEach(async () => {
    const mockProfileRepo = {
      findProfile: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockMarkdownService = {
      renderMarkdown: jest.fn((md: string) => `<p>${md}</p>\n`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileService,
        { provide: ProfileRepositoryPort, useValue: mockProfileRepo },
        { provide: MarkdownService, useValue: mockMarkdownService },
      ],
    }).compile();

    service = module.get<UpdateProfileService>(UpdateProfileService);
    profileRepo = module.get(ProfileRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update single field', async () => {
    const input = {
      fullName: 'Jane Doe',
    };

    const updatedProfile = new Profile({
      ...existingProfile,
      fullName: 'Jane Doe',
    });

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockResolvedValue(updatedProfile);

    const result = await service.execute(input);

    expect(profileRepo.findProfile).toHaveBeenCalled();
    expect(profileRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Jane Doe',
        title: 'Software Engineer', // Unchanged
        email: 'john@example.com', // Unchanged
      }),
    );
    expect(result.fullName).toBe('Jane Doe');
  });

  it('should update multiple fields', async () => {
    const input = {
      fullName: 'Jane Smith',
      title: 'Senior Engineer',
      yearsOfExperience: 10,
    };

    const updatedProfile = new Profile({
      ...existingProfile,
      fullName: 'Jane Smith',
      title: 'Senior Engineer',
      yearsOfExperience: 10,
    });

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockResolvedValue(updatedProfile);

    const result = await service.execute(input);

    expect(result.fullName).toBe('Jane Smith');
    expect(result.title).toBe('Senior Engineer');
    expect(result.yearsOfExperience).toBe(10);
    expect(result.email).toBe('john@example.com'); // Unchanged
  });

  it('should preserve unchanged fields', async () => {
    const input = {
      bio: 'Updated bio',
    };

    const updatedProfile = new Profile({
      ...existingProfile,
      bio: 'Updated bio',
    });

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockResolvedValue(updatedProfile);

    const result = await service.execute(input);

    expect(result.bio).toBe('Updated bio');
    expect(result.fullName).toBe('John Doe');
    expect(result.title).toBe('Software Engineer');
    expect(result.email).toBe('john@example.com');
    expect(result.phone).toBe('+1-555-0000');
    expect(result.location).toBe('Boston, MA');
  });

  it('should update socialLinks with full array replacement', async () => {
    const input = {
      socialLinks: [
        {
          platform: SocialPlatform.LINKEDIN,
          url: 'https://linkedin.com/in/janedoe',
          username: 'janedoe',
        },
        {
          platform: SocialPlatform.TWITTER,
          url: 'https://twitter.com/janedoe',
          username: 'janedoe',
        },
      ],
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    const result = await service.execute(input);

    expect(result.socialLinks).toHaveLength(2);
    expect(result.socialLinks[0].platform).toBe(SocialPlatform.LINKEDIN);
    expect(result.socialLinks[1].platform).toBe(SocialPlatform.TWITTER);
  });

  it('should set nullable field to null', async () => {
    const input = {
      phone: null,
      profilePictureUrl: null,
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    const result = await service.execute(input);

    expect(result.phone).toBeNull();
    expect(result.profilePictureUrl).toBeNull();
    expect(result.resumeUrl).toBe('https://example.com/old-resume.pdf'); // Unchanged
  });

  it('should throw NotFoundException when profile does not exist', async () => {
    const input = {
      fullName: 'Jane Doe',
    };

    profileRepo.findProfile.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toThrow(NotFoundException);
    await expect(service.execute(input)).rejects.toThrow('Profile not found');

    expect(profileRepo.findProfile).toHaveBeenCalled();
    expect(profileRepo.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid email', async () => {
    const input = {
      email: 'invalid-email',
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    await expect(service.execute(input)).rejects.toThrow(
      'Invalid email format',
    );

    expect(profileRepo.findProfile).toHaveBeenCalled();
    expect(profileRepo.update).not.toHaveBeenCalled();
  });

  it('should validate email without @ symbol', async () => {
    const input = {
      email: 'nodomain.com',
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    expect(profileRepo.update).not.toHaveBeenCalled();
  });

  it('should validate email without domain extension', async () => {
    const input = {
      email: 'jane@example',
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    expect(profileRepo.update).not.toHaveBeenCalled();
  });

  it('should handle empty update (no changes)', async () => {
    const input = {};

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockResolvedValue(existingProfile);

    const result = await service.execute(input);

    expect(profileRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'profile-1',
        fullName: 'John Doe',
        title: 'Software Engineer',
      }),
    );
    expect(result).toEqual(existingProfile);
  });

  it('should preserve id field', async () => {
    const input = {
      fullName: 'Updated Name',
      email: 'newemail@example.com',
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    const result = await service.execute(input);

    expect(result.id).toBe('profile-1');
  });

  it('should update availability status', async () => {
    const input = {
      availability: AvailabilityStatus.OPEN_TO_OFFERS,
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    const result = await service.execute(input);

    expect(result.availability).toBe(AvailabilityStatus.OPEN_TO_OFFERS);
  });

  it('should handle empty socialLinks array', async () => {
    const input = {
      socialLinks: [],
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);
    profileRepo.update.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    const result = await service.execute(input);

    expect(result.socialLinks).toHaveLength(0);
  });
});
