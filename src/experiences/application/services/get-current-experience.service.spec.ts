import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentExperienceService } from './get-current-experience.service';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

describe('GetCurrentExperienceService', () => {
  let service: GetCurrentExperienceService;
  let repo: jest.Mocked<ExperienceRepositoryPort>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findCurrent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentExperienceService,
        { provide: ExperienceRepositoryPort, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GetCurrentExperienceService>(
      GetCurrentExperienceService,
    );
    repo = module.get(ExperienceRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return current experience from repository', async () => {
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

    repo.findCurrent.mockResolvedValue(experience);

    const result = await service.execute();

    expect(repo.findCurrent).toHaveBeenCalled();
    expect(result).toEqual(experience);
  });

  it('should return null when no current experience exists', async () => {
    repo.findCurrent.mockResolvedValue(null);

    const result = await service.execute();

    expect(result).toBeNull();
  });
});
