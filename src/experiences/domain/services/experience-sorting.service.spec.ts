import { ExperienceSortingService } from './experience-sorting.service';
import { Experience } from '../entities/experience.entity';

describe('ExperienceSortingService', () => {
  let service: ExperienceSortingService;

  beforeEach(() => {
    service = new ExperienceSortingService();
  });

  it('should sort experiences by order ascending', () => {
    const experiences = [
      new Experience({
        id: '2',
        company: 'Company B',
        title: 'Title B',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2021-01-01'),
        description: 'Description',
        technologies: [],
        achievements: [],
        location: 'Location',
        isCurrent: false,
        isHighlighted: false,
        order: 2,
      }),
      new Experience({
        id: '1',
        company: 'Company A',
        title: 'Title A',
        startDate: new Date('2021-01-01'),
        endDate: null,
        description: 'Description',
        technologies: [],
        achievements: [],
        location: 'Location',
        isCurrent: true,
        isHighlighted: true,
        order: 0,
      }),
      new Experience({
        id: '3',
        company: 'Company C',
        title: 'Title C',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2020-01-01'),
        description: 'Description',
        technologies: [],
        achievements: [],
        location: 'Location',
        isCurrent: false,
        isHighlighted: false,
        order: 1,
      }),
    ];

    const result = service.sortByOrder(experiences);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
    expect(result[2].id).toBe('2');
  });

  it('should handle empty array', () => {
    const result = service.sortByOrder([]);
    expect(result).toEqual([]);
  });

  it('should not mutate original array', () => {
    const experiences = [
      new Experience({
        id: '2',
        company: 'Company B',
        title: 'Title B',
        startDate: new Date('2020-01-01'),
        endDate: null,
        description: 'Description',
        technologies: [],
        achievements: [],
        location: 'Location',
        isCurrent: false,
        isHighlighted: false,
        order: 1,
      }),
      new Experience({
        id: '1',
        company: 'Company A',
        title: 'Title A',
        startDate: new Date('2021-01-01'),
        endDate: null,
        description: 'Description',
        technologies: [],
        achievements: [],
        location: 'Location',
        isCurrent: true,
        isHighlighted: true,
        order: 0,
      }),
    ];

    const original = [...experiences];
    service.sortByOrder(experiences);

    expect(experiences).toEqual(original);
  });
});
