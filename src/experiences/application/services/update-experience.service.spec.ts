import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateExperienceService } from './update-experience.service';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

describe('UpdateExperienceService', () => {
  let service: UpdateExperienceService;
  let mockRepository: jest.Mocked<ExperienceRepositoryPort>;

  const existingExperience = new Experience({
    id: 'existing-id',
    company: 'Anthropic',
    title: 'Senior Software Engineer',
    startDate: new Date('2023-01-15'),
    endDate: null,
    description: 'Building AI applications',
    technologies: ['TypeScript', 'React'],
    achievements: ['Led team'],
    location: 'San Francisco, CA',
    isCurrent: true,
    isHighlighted: false,
    order: 1,
  });

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByCompanyAndTitleExcludingId: jest.fn(),
      update: jest.fn(),
      findByCompanyAndTitle: jest.fn(),
      getMaxOrder: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findCurrent: jest.fn(),
    };

    service = new UpdateExperienceService(mockRepository);
  });

  describe('execute', () => {
    it('should update experience successfully', async () => {
      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Staff Software Engineer',
        startDate: '2023-01-15',
        endDate: '2024-12-31',
        description: 'Leading AI projects',
        technologies: ['TypeScript', 'React', 'Node.js'],
        achievements: ['Promoted to Staff', 'Built new feature'],
        location: 'San Francisco, CA',
        isHighlighted: true,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);
      mockRepository.update.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(mockRepository.findById).toHaveBeenCalledWith('existing-id');
      expect(
        mockRepository.findByCompanyAndTitleExcludingId,
      ).toHaveBeenCalledWith(
        'Anthropic',
        'Staff Software Engineer',
        'existing-id',
      );
      expect(result.title).toBe('Staff Software Engineer');
      expect(result.description).toBe('Leading AI projects');
      expect(result.technologies).toEqual(['TypeScript', 'React', 'Node.js']);
      expect(result.achievements).toEqual([
        'Promoted to Staff',
        'Built new feature',
      ]);
      expect(result.isHighlighted).toBe(true);
      expect(result.isCurrent).toBe(false);
      expect(result.order).toBe(1);
    });

    it('should preserve order from existing experience', async () => {
      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        description: 'Updated description',
        technologies: ['TypeScript'],
        location: 'San Francisco, CA',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);
      mockRepository.update.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(result.order).toBe(existingExperience.order);
    });

    it('should compute isCurrent from endDate', async () => {
      const inputWithEndDate = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        endDate: '2024-12-31',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'San Francisco, CA',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);
      mockRepository.update.mockImplementation((exp) => Promise.resolve(exp));

      const resultWithEnd = await service.execute(inputWithEndDate);
      expect(resultWithEnd.isCurrent).toBe(false);

      const inputWithoutEndDate = {
        ...inputWithEndDate,
        endDate: undefined,
      };

      const resultWithoutEnd = await service.execute(inputWithoutEndDate);
      expect(resultWithoutEnd.isCurrent).toBe(true);
    });

    it('should throw NotFoundException when experience not found', async () => {
      const input = {
        id: 'non-existent-id',
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-01-01',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(NotFoundException);
      await expect(service.execute(input)).rejects.toThrow(
        "Experience with id 'non-existent-id' not found",
      );
    });

    it('should throw ConflictException for duplicate company and title', async () => {
      const duplicateExperience = new Experience({
        id: 'other-id',
        company: 'Anthropic',
        title: 'Staff Engineer',
        startDate: new Date('2022-01-01'),
        endDate: null,
        description: 'Other role',
        technologies: ['Go'],
        achievements: [],
        location: 'NYC',
        isCurrent: true,
        isHighlighted: false,
        order: 2,
      });

      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Staff Engineer',
        startDate: '2023-01-15',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(
        duplicateExperience,
      );

      await expect(service.execute(input)).rejects.toThrow(ConflictException);
      await expect(service.execute(input)).rejects.toThrow(
        'Experience at Anthropic with title "Staff Engineer" already exists',
      );
    });

    it('should allow same company and title when updating own record', async () => {
      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        description: 'Updated description',
        technologies: ['TypeScript'],
        location: 'San Francisco, CA',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);
      mockRepository.update.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(result).toBeDefined();
      expect(
        mockRepository.findByCompanyAndTitleExcludingId,
      ).toHaveBeenCalledWith(
        'Anthropic',
        'Senior Software Engineer',
        'existing-id',
      );
    });

    it('should reject future start date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Engineer',
        startDate: futureDate.toISOString().split('T')[0],
        description: 'Future job',
        technologies: ['TypeScript'],
        location: 'SF',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'Start date cannot be in the future',
      );
    });

    it('should reject start date after end date', async () => {
      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-06-30',
        endDate: '2024-01-15',
        description: 'Invalid dates',
        technologies: ['TypeScript'],
        location: 'SF',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'Start date must be before end date',
      );
    });

    it('should convert string dates to Date objects', async () => {
      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);
      mockRepository.update.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it('should handle undefined achievements', async () => {
      const input = {
        id: 'existing-id',
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-01-01',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
        isHighlighted: false,
      };

      mockRepository.findById.mockResolvedValue(existingExperience);
      mockRepository.findByCompanyAndTitleExcludingId.mockResolvedValue(null);
      mockRepository.update.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(result.achievements).toEqual([]);
    });
  });
});
