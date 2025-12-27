import { Test, TestingModule } from '@nestjs/testing';
import { GetSkillsService } from './get-skills.service';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillGroupingService } from '../../domain/services/skill-grouping.service';
import { Skill } from '../../domain/entities/skill.entity';
import { SkillCategory } from '../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../domain/value-objects/proficiency-level.vo';

describe('GetSkillsService', () => {
  let service: GetSkillsService;
  let skillRepo: jest.Mocked<SkillRepositoryPort>;
  let categoryRepo: jest.Mocked<SkillCategoryRepositoryPort>;
  let groupingService: SkillGroupingService;

  beforeEach(async () => {
    const mockSkillRepo = {
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findHighlighted: jest.fn(),
    };

    const mockCategoryRepo = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSkillsService,
        { provide: SkillRepositoryPort, useValue: mockSkillRepo },
        { provide: SkillCategoryRepositoryPort, useValue: mockCategoryRepo },
        SkillGroupingService,
      ],
    }).compile();

    service = module.get<GetSkillsService>(GetSkillsService);
    skillRepo = module.get(SkillRepositoryPort);
    categoryRepo = module.get(SkillCategoryRepositoryPort);
    groupingService = module.get<SkillGroupingService>(SkillGroupingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return grouped skills by category', async () => {
    const categories = [
      new SkillCategory('1', 'Languages', 'languages', 0),
      new SkillCategory('2', 'Frameworks', 'frameworks', 1),
    ];

    const skills = [
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
      new Skill('2', 'NestJS', '2', ProficiencyLevel.EXPERT, 4, 0, true),
    ];

    categoryRepo.findAll.mockResolvedValue(categories);
    skillRepo.findAll.mockResolvedValue(skills);

    const result = await service.execute();

    expect(categoryRepo.findAll).toHaveBeenCalled();
    expect(skillRepo.findAll).toHaveBeenCalled();
    expect(result.size).toBe(2);
    expect(result.get(categories[0])).toHaveLength(1);
    expect(result.get(categories[1])).toHaveLength(1);
  });

  it('should handle empty results', async () => {
    categoryRepo.findAll.mockResolvedValue([]);
    skillRepo.findAll.mockResolvedValue([]);

    const result = await service.execute();

    expect(result.size).toBe(0);
  });

  it('should use grouping service for organizing data', async () => {
    const categories = [new SkillCategory('1', 'Languages', 'languages', 0)];
    const skills = [
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
    ];

    categoryRepo.findAll.mockResolvedValue(categories);
    skillRepo.findAll.mockResolvedValue(skills);

    const groupBySpy = jest.spyOn(groupingService, 'groupByCategory');

    await service.execute();

    expect(groupBySpy).toHaveBeenCalledWith(categories, skills);
  });
});
