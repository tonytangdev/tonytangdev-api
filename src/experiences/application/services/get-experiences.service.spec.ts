import { Test, TestingModule } from '@nestjs/testing';
import { GetExperiencesService } from './get-experiences.service';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

describe('GetExperiencesService', () => {
  let service: GetExperiencesService;
  let repo: jest.Mocked<ExperienceRepositoryPort>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findCurrent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetExperiencesService,
        { provide: ExperienceRepositoryPort, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GetExperiencesService>(GetExperiencesService);
    repo = module.get(ExperienceRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all experiences from repository', async () => {
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

    repo.findAll.mockResolvedValue(experiences);

    const result = await service.execute();

    expect(repo.findAll).toHaveBeenCalled();
    expect(result).toEqual(experiences);
  });

  it('should handle empty results', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await service.execute();

    expect(result).toEqual([]);
  });
});
