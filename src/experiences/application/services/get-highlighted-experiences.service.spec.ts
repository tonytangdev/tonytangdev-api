import { Test, TestingModule } from '@nestjs/testing';
import { GetHighlightedExperiencesService } from './get-highlighted-experiences.service';
import { ExperienceRepositoryPort } from '../ports/outbound/experience.repository.port';
import { Experience } from '../../domain/entities/experience.entity';

describe('GetHighlightedExperiencesService', () => {
  let service: GetHighlightedExperiencesService;
  let repo: jest.Mocked<ExperienceRepositoryPort>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findCurrent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHighlightedExperiencesService,
        { provide: ExperienceRepositoryPort, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GetHighlightedExperiencesService>(
      GetHighlightedExperiencesService,
    );
    repo = module.get(ExperienceRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return highlighted experiences from repository', async () => {
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

    repo.findHighlighted.mockResolvedValue(experiences);

    const result = await service.execute();

    expect(repo.findHighlighted).toHaveBeenCalled();
    expect(result).toEqual(experiences);
  });

  it('should handle empty results', async () => {
    repo.findHighlighted.mockResolvedValue([]);

    const result = await service.execute();

    expect(result).toEqual([]);
  });
});
