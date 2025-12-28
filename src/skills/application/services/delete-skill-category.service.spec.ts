import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteSkillCategoryService } from './delete-skill-category.service';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategory } from '../../domain/entities/skill-category.entity';
import { Skill } from '../../domain/entities/skill.entity';
import { ProficiencyLevel } from '../../domain/value-objects/proficiency-level.vo';

describe('DeleteSkillCategoryService', () => {
  let service: DeleteSkillCategoryService;
  let categoryRepo: jest.Mocked<SkillCategoryRepositoryPort>;
  let skillRepo: jest.Mocked<SkillRepositoryPort>;

  beforeEach(async () => {
    const mockCategoryRepo = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      getMaxOrder: jest.fn(),
      update: jest.fn(),
      findByNameExcludingId: jest.fn(),
      findBySlugExcludingId: jest.fn(),
      delete: jest.fn(),
    };

    const mockSkillRepo = {
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findHighlighted: jest.fn(),
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      getMaxOrder: jest.fn(),
      update: jest.fn(),
      findByNameExcludingId: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSkillCategoryService,
        { provide: SkillCategoryRepositoryPort, useValue: mockCategoryRepo },
        { provide: SkillRepositoryPort, useValue: mockSkillRepo },
      ],
    }).compile();

    service = module.get<DeleteSkillCategoryService>(
      DeleteSkillCategoryService,
    );
    categoryRepo = module.get(SkillCategoryRepositoryPort);
    skillRepo = module.get(SkillRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete category successfully when no skills exist', async () => {
    const existingCategory = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 1,
    });

    categoryRepo.findById.mockResolvedValue(existingCategory);
    skillRepo.findByCategory.mockResolvedValue([]);
    categoryRepo.delete.mockResolvedValue(undefined);

    await service.execute({ id: 'cat-1' });

    expect(categoryRepo.findById).toHaveBeenCalledWith('cat-1');
    expect(skillRepo.findByCategory).toHaveBeenCalledWith('cat-1');
    expect(categoryRepo.delete).toHaveBeenCalledWith('cat-1');
  });

  it('should throw NotFoundException when category not found', async () => {
    categoryRepo.findById.mockResolvedValue(null);

    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      "Category with id 'non-existent' not found",
    );

    expect(categoryRepo.findById).toHaveBeenCalledWith('non-existent');
    expect(skillRepo.findByCategory).not.toHaveBeenCalled();
    expect(categoryRepo.delete).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when category has skills', async () => {
    const existingCategory = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 1,
    });

    const skills = [
      new Skill({
        id: 'skill-1',
        name: 'TypeScript',
        categoryId: 'cat-1',
        proficiency: ProficiencyLevel.ADVANCED,
        yearsOfExperience: 5,
        order: 1,
        isHighlighted: true,
      }),
      new Skill({
        id: 'skill-2',
        name: 'JavaScript',
        categoryId: 'cat-1',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 8,
        order: 2,
        isHighlighted: true,
      }),
    ];

    categoryRepo.findById.mockResolvedValue(existingCategory);
    skillRepo.findByCategory.mockResolvedValue(skills);

    await expect(service.execute({ id: 'cat-1' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.execute({ id: 'cat-1' })).rejects.toThrow(
      "Cannot delete category 'Languages' because it has 2 skill(s)",
    );

    expect(categoryRepo.findById).toHaveBeenCalledWith('cat-1');
    expect(skillRepo.findByCategory).toHaveBeenCalledWith('cat-1');
    expect(categoryRepo.delete).not.toHaveBeenCalled();
  });
});
