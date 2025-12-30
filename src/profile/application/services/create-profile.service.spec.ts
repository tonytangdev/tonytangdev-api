import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateProfileService } from './create-profile.service';
import { ProfileRepositoryPort } from '../ports/outbound/profile.repository.port';
import { Profile } from '../../domain/entities/profile.entity';
import { SocialLink } from '../../domain/entities/social-link.entity';
import { AvailabilityStatus } from '../../domain/value-objects/availability-status.vo';
import { SocialPlatform } from '../../domain/value-objects/social-platform.vo';
import { MarkdownService } from '../../../common/services/markdown.service';

describe('CreateProfileService', () => {
  let service: CreateProfileService;
  let profileRepo: jest.Mocked<ProfileRepositoryPort>;

  beforeEach(async () => {
    const mockProfileRepo = {
      findProfile: jest.fn(),
      create: jest.fn(),
    };

    const mockMarkdownService = {
      renderMarkdown: jest.fn((md: string) => `<p>${md}</p>\n`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProfileService,
        { provide: ProfileRepositoryPort, useValue: mockProfileRepo },
        { provide: MarkdownService, useValue: mockMarkdownService },
      ],
    }).compile();

    service = module.get<CreateProfileService>(CreateProfileService);
    profileRepo = module.get(ProfileRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a profile successfully', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer with passion for clean code',
      email: 'jane@example.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
      socialLinks: [
        {
          platform: SocialPlatform.GITHUB,
          url: 'https://github.com/janedoe',
          username: 'janedoe',
        },
      ],
    };

    const expectedProfile = new Profile({
      id: expect.any(String),
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer with passion for clean code',
      email: 'jane@example.com',
      phone: null,
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
      profilePictureUrl: null,
      resumeUrl: null,
      socialLinks: [
        new SocialLink({
          platform: SocialPlatform.GITHUB,
          url: 'https://github.com/janedoe',
          username: 'janedoe',
        }),
      ],
    });

    profileRepo.findProfile.mockResolvedValue(null);
    profileRepo.create.mockResolvedValue(expectedProfile);

    const result = await service.execute(input);

    expect(profileRepo.findProfile).toHaveBeenCalled();
    expect(profileRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        yearsOfExperience: 5,
      }),
    );
    expect(result).toEqual(expectedProfile);
  });

  it('should create profile with optional fields', async () => {
    const input = {
      fullName: 'John Smith',
      title: 'Software Developer',
      bio: 'Passionate developer',
      email: 'john@example.com',
      phone: '+1-555-1234',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      availability: AvailabilityStatus.OPEN_TO_OFFERS,
      yearsOfExperience: 3,
      profilePictureUrl: 'https://example.com/pic.jpg',
      resumeUrl: 'https://example.com/resume.pdf',
      socialLinks: [
        {
          platform: SocialPlatform.LINKEDIN,
          url: 'https://linkedin.com/in/johnsmith',
          username: 'johnsmith',
        },
        {
          platform: SocialPlatform.TWITTER,
          url: 'https://twitter.com/johnsmith',
          username: 'johnsmith',
        },
      ],
    };

    const expectedProfile = new Profile({
      id: expect.any(String),
      fullName: 'John Smith',
      title: 'Software Developer',
      bio: 'Passionate developer',
      email: 'john@example.com',
      phone: '+1-555-1234',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      availability: AvailabilityStatus.OPEN_TO_OFFERS,
      yearsOfExperience: 3,
      profilePictureUrl: 'https://example.com/pic.jpg',
      resumeUrl: 'https://example.com/resume.pdf',
      socialLinks: [
        new SocialLink({
          platform: SocialPlatform.LINKEDIN,
          url: 'https://linkedin.com/in/johnsmith',
          username: 'johnsmith',
        }),
        new SocialLink({
          platform: SocialPlatform.TWITTER,
          url: 'https://twitter.com/johnsmith',
          username: 'johnsmith',
        }),
      ],
    });

    profileRepo.findProfile.mockResolvedValue(null);
    profileRepo.create.mockResolvedValue(expectedProfile);

    const result = await service.execute(input);

    expect(result.phone).toBe('+1-555-1234');
    expect(result.profilePictureUrl).toBe('https://example.com/pic.jpg');
    expect(result.resumeUrl).toBe('https://example.com/resume.pdf');
    expect(result.socialLinks).toHaveLength(2);
  });

  it('should create profile without optional fields', async () => {
    const input = {
      fullName: 'Bob Johnson',
      title: 'Junior Developer',
      bio: 'Learning every day',
      email: 'bob@example.com',
      location: 'Austin, TX',
      timezone: 'America/Chicago',
      availability: AvailabilityStatus.NOT_AVAILABLE,
      yearsOfExperience: 1,
    };

    const expectedProfile = new Profile({
      id: expect.any(String),
      fullName: 'Bob Johnson',
      title: 'Junior Developer',
      bio: 'Learning every day',
      email: 'bob@example.com',
      phone: null,
      location: 'Austin, TX',
      timezone: 'America/Chicago',
      availability: AvailabilityStatus.NOT_AVAILABLE,
      yearsOfExperience: 1,
      profilePictureUrl: null,
      resumeUrl: null,
      socialLinks: [],
    });

    profileRepo.findProfile.mockResolvedValue(null);
    profileRepo.create.mockResolvedValue(expectedProfile);

    const result = await service.execute(input);

    expect(result.phone).toBeNull();
    expect(result.profilePictureUrl).toBeNull();
    expect(result.resumeUrl).toBeNull();
    expect(result.socialLinks).toHaveLength(0);
  });

  it('should throw ConflictException when profile already exists', async () => {
    const existingProfile = new Profile({
      id: 'profile-1',
      fullName: 'Existing User',
      title: 'Developer',
      bio: 'Bio',
      email: 'existing@example.com',
      phone: null,
      location: 'NYC',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
      profilePictureUrl: null,
      resumeUrl: null,
      socialLinks: [],
    });

    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'jane@example.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
    };

    profileRepo.findProfile.mockResolvedValue(existingProfile);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      'Profile already exists',
    );

    expect(profileRepo.findProfile).toHaveBeenCalled();
    expect(profileRepo.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid email', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'invalid-email',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
    };

    profileRepo.findProfile.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    await expect(service.execute(input)).rejects.toThrow(
      'Invalid email format',
    );

    expect(profileRepo.findProfile).toHaveBeenCalled();
    expect(profileRepo.create).not.toHaveBeenCalled();
  });

  it('should validate email without @ symbol', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'nodomain.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
    };

    profileRepo.findProfile.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    expect(profileRepo.create).not.toHaveBeenCalled();
  });

  it('should validate email without domain extension', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'jane@example',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
    };

    profileRepo.findProfile.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    expect(profileRepo.create).not.toHaveBeenCalled();
  });

  it('should generate UUID for profile', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'jane@example.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
    };

    profileRepo.findProfile.mockResolvedValue(null);
    profileRepo.create.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    await service.execute(input);

    expect(profileRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
      }),
    );
  });

  it('should create social links with correct structure', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'jane@example.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
      socialLinks: [
        {
          platform: SocialPlatform.GITHUB,
          url: 'https://github.com/janedoe',
          username: 'janedoe',
        },
        {
          platform: SocialPlatform.LINKEDIN,
          url: 'https://linkedin.com/in/janedoe',
          username: 'janedoe',
        },
      ],
    };

    profileRepo.findProfile.mockResolvedValue(null);
    profileRepo.create.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    await service.execute(input);

    expect(profileRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        socialLinks: expect.arrayContaining([
          expect.objectContaining({
            platform: SocialPlatform.GITHUB,
            url: 'https://github.com/janedoe',
            username: 'janedoe',
          }),
          expect.objectContaining({
            platform: SocialPlatform.LINKEDIN,
            url: 'https://linkedin.com/in/janedoe',
            username: 'janedoe',
          }),
        ]),
      }),
    );
  });

  it('should handle empty social links array', async () => {
    const input = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer',
      email: 'jane@example.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: AvailabilityStatus.AVAILABLE,
      yearsOfExperience: 5,
      socialLinks: [],
    };

    profileRepo.findProfile.mockResolvedValue(null);
    profileRepo.create.mockImplementation((profile) =>
      Promise.resolve(profile),
    );

    await service.execute(input);

    expect(profileRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        socialLinks: [],
      }),
    );
  });
});
