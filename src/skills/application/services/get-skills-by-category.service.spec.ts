import { Test, TestingModule } from '@nestjs/testing';
import { GetSkillsByCategoryService } from './get-skills-by-category.service';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { Skill } from '../../domain/entities/skill.entity';
import { SkillCategory } from '../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../domain/value-objects/proficiency-level.vo';

describe('GetSkillsByCategoryService', () => {
  let service: GetSkillsByCategoryService;
  let skillRepo: jest.Mocked<SkillRepositoryPort>;
  let categoryRepo: jest.Mocked<SkillCategoryRepositoryPort>;

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
        GetSkillsByCategoryService,
        { provide: SkillRepositoryPort, useValue: mockSkillRepo },
        { provide: SkillCategoryRepositoryPort, useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<GetSkillsByCategoryService>(
      GetSkillsByCategoryService,
    );
    skillRepo = module.get(SkillRepositoryPort);
    categoryRepo = module.get(SkillCategoryRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return category with its skills', async () => {
    const category = new SkillCategory('1', 'Languages', 'languages', 0);
    const skills = [
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
      new Skill('2', 'JavaScript', '1', ProficiencyLevel.EXPERT, 7, 1, true),
    ];

    categoryRepo.findBySlug.mockResolvedValue(category);
    skillRepo.findByCategory.mockResolvedValue(skills);

    const result = await service.execute('languages');

    expect(categoryRepo.findBySlug).toHaveBeenCalledWith('languages');
    expect(skillRepo.findByCategory).toHaveBeenCalledWith('1');
    expect(result).not.toBeNull();
    expect(result!.category).toEqual(category);
    expect(result!.skills).toEqual(skills);
  });

  it('should return null when category not found', async () => {
    categoryRepo.findBySlug.mockResolvedValue(null);

    const result = await service.execute('non-existent');

    expect(categoryRepo.findBySlug).toHaveBeenCalledWith('non-existent');
    expect(skillRepo.findByCategory).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return category with empty skills array', async () => {
    const category = new SkillCategory('1', 'Languages', 'languages', 0);

    categoryRepo.findBySlug.mockResolvedValue(category);
    skillRepo.findByCategory.mockResolvedValue([]);

    const result = await service.execute('languages');

    expect(result).not.toBeNull();
    expect(result!.category).toEqual(category);
    expect(result!.skills).toEqual([]);
  });
});
