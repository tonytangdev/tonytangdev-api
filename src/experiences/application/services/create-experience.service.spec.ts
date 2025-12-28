import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateExperienceService } from './create-experience.service';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

describe('CreateExperienceService', () => {
  let service: CreateExperienceService;
  let mockRepository: jest.Mocked<ExperienceRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      findByCompanyAndTitle: jest.fn(),
      getMaxOrder: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findCurrent: jest.fn(),
    };

    service = new CreateExperienceService(mockRepository);
  });

  describe('execute', () => {
    it('should create experience with required fields', async () => {
      const input = {
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        location: 'San Francisco, CA',
      };

      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);
      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(mockRepository.findByCompanyAndTitle).toHaveBeenCalledWith(
        'Anthropic',
        'Senior Software Engineer',
      );
      expect(mockRepository.getMaxOrder).toHaveBeenCalled();
      expect(result).toMatchObject({
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        location: 'San Francisco, CA',
        achievements: [],
        isCurrent: true,
        isHighlighted: false,
        order: 1,
      });
      expect(result.id).toBeDefined();
      expect(result.endDate).toBeNull();
    });

    it('should create experience with all fields', async () => {
      const input = {
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        endDate: '2024-06-30',
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        achievements: ['Led team of 5', 'Shipped major feature'],
        location: 'San Francisco, CA',
      };

      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);
      mockRepository.getMaxOrder.mockResolvedValue(2);
      mockRepository.create.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute(input);

      expect(result.achievements).toEqual([
        'Led team of 5',
        'Shipped major feature',
      ]);
      expect(result.isCurrent).toBe(false);
      expect(result.order).toBe(3);
      expect(result.endDate).not.toBeNull();
    });

    it('should reject duplicate company and title', async () => {
      const existingExperience = new Experience({
        id: '123',
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: new Date('2023-01-15'),
        endDate: null,
        description: 'Existing',
        technologies: ['TypeScript'],
        achievements: [],
        location: 'SF',
        isCurrent: true,
        isHighlighted: false,
        order: 1,
      });

      mockRepository.findByCompanyAndTitle.mockResolvedValue(
        existingExperience,
      );

      await expect(
        service.execute({
          company: 'Anthropic',
          title: 'Senior Software Engineer',
          startDate: '2024-01-01',
          description: 'New',
          technologies: ['Go'],
          location: 'SF',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject future start date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);

      await expect(
        service.execute({
          company: 'Anthropic',
          title: 'Engineer',
          startDate: futureDate.toISOString().split('T')[0],
          description: 'Future job',
          technologies: ['TypeScript'],
          location: 'SF',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject start date after end date', async () => {
      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);

      await expect(
        service.execute({
          company: 'Anthropic',
          title: 'Engineer',
          startDate: '2024-06-30',
          endDate: '2024-01-15',
          description: 'Invalid dates',
          technologies: ['TypeScript'],
          location: 'SF',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should auto-increment order', async () => {
      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);
      mockRepository.getMaxOrder.mockResolvedValue(5);
      mockRepository.create.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute({
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-01-01',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
      });

      expect(result.order).toBe(6);
    });

    it('should generate UUID for new experience', async () => {
      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);
      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute({
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-01-01',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
      });

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should convert string dates to Date objects', async () => {
      mockRepository.findByCompanyAndTitle.mockResolvedValue(null);
      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((exp) => Promise.resolve(exp));

      const result = await service.execute({
        company: 'Anthropic',
        title: 'Engineer',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        description: 'Test',
        technologies: ['TypeScript'],
        location: 'SF',
      });

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });
});
