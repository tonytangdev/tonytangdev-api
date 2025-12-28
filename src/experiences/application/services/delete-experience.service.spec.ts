import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteExperienceService } from './delete-experience.service';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

describe('DeleteExperienceService', () => {
  let service: DeleteExperienceService;
  let experienceRepo: jest.Mocked<ExperienceRepositoryPort>;

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteExperienceService,
        {
          provide: ExperienceRepositoryPort,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<DeleteExperienceService>(DeleteExperienceService);
    experienceRepo = module.get(ExperienceRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete experience successfully', async () => {
    const existingExperience = new Experience({
      id: 'exp-1',
      company: 'Tech Corp',
      title: 'Senior Engineer',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2023-12-31'),
      description: 'Work description',
      technologies: ['Node.js'],
      achievements: ['Built API'],
      location: 'Remote',
      isCurrent: false,
      isHighlighted: true,
      order: 1,
    });

    experienceRepo.findById.mockResolvedValue(existingExperience);
    experienceRepo.delete.mockResolvedValue(undefined);

    await service.execute({ id: 'exp-1' });

    expect(experienceRepo.findById).toHaveBeenCalledWith('exp-1');
    expect(experienceRepo.delete).toHaveBeenCalledWith('exp-1');
  });

  it('should throw NotFoundException when experience not found', async () => {
    experienceRepo.findById.mockResolvedValue(null);

    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      "Experience with id 'non-existent' not found",
    );

    expect(experienceRepo.delete).not.toHaveBeenCalled();
  });
});
