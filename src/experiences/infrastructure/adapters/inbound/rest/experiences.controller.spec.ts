import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExperiencesController } from './experiences.controller';
import { GetExperiencesUseCase } from '../../../../application/ports/inbound/get-experiences.use-case';
import { GetHighlightedExperiencesUseCase } from '../../../../application/ports/inbound/get-highlighted-experiences.use-case';
import { GetCurrentExperienceUseCase } from '../../../../application/ports/inbound/get-current-experience.use-case';
import { CreateExperienceUseCase } from '../../../../application/ports/inbound/create-experience.use-case';
import { ExperienceMapper } from '../mappers/experience.mapper';
import { Experience } from '../../../../domain/entities/experience.entity';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('ExperiencesController', () => {
  let controller: ExperiencesController;
  let getExperiencesUseCase: jest.Mocked<GetExperiencesUseCase>;
  let getHighlightedExperiencesUseCase: jest.Mocked<GetHighlightedExperiencesUseCase>;
  let getCurrentExperienceUseCase: jest.Mocked<GetCurrentExperienceUseCase>;
  let createExperienceUseCase: jest.Mocked<CreateExperienceUseCase>;

  beforeEach(async () => {
    const mockGetExperiencesUseCase = {
      execute: jest.fn(),
    };

    const mockGetHighlightedExperiencesUseCase = {
      execute: jest.fn(),
    };

    const mockGetCurrentExperienceUseCase = {
      execute: jest.fn(),
    };

    const mockCreateExperienceUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperiencesController],
      providers: [
        { provide: GetExperiencesUseCase, useValue: mockGetExperiencesUseCase },
        {
          provide: GetHighlightedExperiencesUseCase,
          useValue: mockGetHighlightedExperiencesUseCase,
        },
        {
          provide: GetCurrentExperienceUseCase,
          useValue: mockGetCurrentExperienceUseCase,
        },
        {
          provide: CreateExperienceUseCase,
          useValue: mockCreateExperienceUseCase,
        },
        ExperienceMapper,
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ExperiencesController>(ExperiencesController);
    getExperiencesUseCase = module.get(GetExperiencesUseCase);
    getHighlightedExperiencesUseCase = module.get(
      GetHighlightedExperiencesUseCase,
    );
    getCurrentExperienceUseCase = module.get(GetCurrentExperienceUseCase);
    createExperienceUseCase = module.get(CreateExperienceUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExperiences', () => {
    it('should return all experiences', async () => {
      const experiences = [
        new Experience({
          id: '1',
          company: 'Company A',
          title: 'Title A',
          startDate: new Date('2021-01-01'),
          endDate: null,
          description: 'Description',
          technologies: ['TypeScript'],
          achievements: ['Achievement'],
          location: 'Remote',
          isCurrent: true,
          isHighlighted: true,
          order: 0,
        }),
        new Experience({
          id: '2',
          company: 'Company B',
          title: 'Title B',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2021-01-01'),
          description: 'Description',
          technologies: ['JavaScript'],
          achievements: ['Achievement'],
          location: 'New York',
          isCurrent: false,
          isHighlighted: false,
          order: 1,
        }),
      ];

      getExperiencesUseCase.execute.mockResolvedValue(experiences);

      const result = await controller.getExperiences();

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.data[0].company).toBe('Company A');
    });

    it('should return empty array when no experiences', async () => {
      getExperiencesUseCase.execute.mockResolvedValue([]);

      const result = await controller.getExperiences();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getHighlightedExperiences', () => {
    it('should return highlighted experiences', async () => {
      const experiences = [
        new Experience({
          id: '1',
          company: 'Company A',
          title: 'Title A',
          startDate: new Date('2021-01-01'),
          endDate: null,
          description: 'Description',
          technologies: ['TypeScript'],
          achievements: ['Achievement'],
          location: 'Remote',
          isCurrent: true,
          isHighlighted: true,
          order: 0,
        }),
      ];

      getHighlightedExperiencesUseCase.execute.mockResolvedValue(experiences);

      const result = await controller.getHighlightedExperiences();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].isHighlighted).toBe(true);
    });

    it('should return empty array when no highlighted experiences', async () => {
      getHighlightedExperiencesUseCase.execute.mockResolvedValue([]);

      const result = await controller.getHighlightedExperiences();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getCurrentExperience', () => {
    it('should return current experience', async () => {
      const experience = new Experience({
        id: '1',
        company: 'Company A',
        title: 'Title A',
        startDate: new Date('2021-01-01'),
        endDate: null,
        description: 'Description',
        technologies: ['TypeScript'],
        achievements: ['Achievement'],
        location: 'Remote',
        isCurrent: true,
        isHighlighted: true,
        order: 0,
      });

      getCurrentExperienceUseCase.execute.mockResolvedValue(experience);

      const result = await controller.getCurrentExperience();

      expect(result.data.company).toBe('Company A');
      expect(result.data.isCurrent).toBe(true);
      expect(result.meta).toEqual({});
    });

    it('should throw NotFoundException when no current experience', async () => {
      getCurrentExperienceUseCase.execute.mockResolvedValue(null);

      await expect(controller.getCurrentExperience()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createExperience', () => {
    it('should create experience with required fields', async () => {
      const dto = {
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        location: 'San Francisco, CA',
      };

      const experience = new Experience({
        id: '123',
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: new Date('2023-01-15'),
        endDate: null,
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        achievements: [],
        location: 'San Francisco, CA',
        isCurrent: true,
        isHighlighted: false,
        order: 1,
      });

      createExperienceUseCase.execute.mockResolvedValue(experience);

      const result = await controller.createExperience(dto);

      expect(createExperienceUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data.company).toBe('Anthropic');
      expect(result.data.title).toBe('Senior Software Engineer');
      expect(result.data.isCurrent).toBe(true);
      expect(result.data.isHighlighted).toBe(false);
      expect(result.meta).toEqual({});
    });

    it('should create experience with all fields', async () => {
      const dto = {
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: '2023-01-15',
        endDate: '2024-06-30',
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        achievements: ['Led team of 5', 'Shipped major feature'],
        location: 'San Francisco, CA',
      };

      const experience = new Experience({
        id: '123',
        company: 'Anthropic',
        title: 'Senior Software Engineer',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2024-06-30'),
        description: 'Building AI applications',
        technologies: ['TypeScript', 'React'],
        achievements: ['Led team of 5', 'Shipped major feature'],
        location: 'San Francisco, CA',
        isCurrent: false,
        isHighlighted: false,
        order: 1,
      });

      createExperienceUseCase.execute.mockResolvedValue(experience);

      const result = await controller.createExperience(dto);

      expect(result.data.achievements).toHaveLength(2);
      expect(result.data.isCurrent).toBe(false);
    });
  });
});
