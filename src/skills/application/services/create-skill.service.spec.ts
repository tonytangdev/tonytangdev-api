import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateSkillService } from './create-skill.service';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { Skill } from '../../domain/entities/skill.entity';
import { SkillCategory } from '../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../domain/value-objects/proficiency-level.vo';

describe('CreateSkillService', () => {
  let service: CreateSkillService;
  let skillRepo: jest.Mocked<SkillRepositoryPort>;
  let categoryRepo: jest.Mocked<SkillCategoryRepositoryPort>;

  beforeEach(async () => {
    const mockSkillRepo = {
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findHighlighted: jest.fn(),
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      getMaxOrder: jest.fn(),
    };

    const mockCategoryRepo = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      getMaxOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSkillService,
        { provide: SkillRepositoryPort, useValue: mockSkillRepo },
        { provide: SkillCategoryRepositoryPort, useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<CreateSkillService>(CreateSkillService);
    skillRepo = module.get(SkillRepositoryPort);
    categoryRepo = module.get(SkillCategoryRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a skill successfully', async () => {
    const category = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 0,
    });

    const input = {
      name: 'TypeScript',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.ADVANCED,
      yearsOfExperience: 5,
      isHighlighted: true,
    };

    const expectedSkill = new Skill({
      id: expect.any(String),
      name: 'TypeScript',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.ADVANCED,
      yearsOfExperience: 5,
      order: 11,
      isHighlighted: true,
    });

    categoryRepo.findById.mockResolvedValue(category);
    skillRepo.findByName.mockResolvedValue(null);
    skillRepo.getMaxOrder.mockResolvedValue(10);
    skillRepo.create.mockResolvedValue(expectedSkill);

    const result = await service.execute(input);

    expect(categoryRepo.findById).toHaveBeenCalledWith('cat-1');
    expect(skillRepo.findByName).toHaveBeenCalledWith('TypeScript');
    expect(skillRepo.getMaxOrder).toHaveBeenCalled();
    expect(skillRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'TypeScript',
        categoryId: 'cat-1',
        proficiency: ProficiencyLevel.ADVANCED,
        yearsOfExperience: 5,
        order: 11,
        isHighlighted: true,
      }),
    );
    expect(result).toEqual(expectedSkill);
  });

  it('should create skill with null yearsOfExperience', async () => {
    const category = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 0,
    });

    const input = {
      name: 'Rust',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.BEGINNER,
      isHighlighted: false,
    };

    const expectedSkill = new Skill({
      id: expect.any(String),
      name: 'Rust',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.BEGINNER,
      yearsOfExperience: null,
      order: 1,
      isHighlighted: false,
    });

    categoryRepo.findById.mockResolvedValue(category);
    skillRepo.findByName.mockResolvedValue(null);
    skillRepo.getMaxOrder.mockResolvedValue(0);
    skillRepo.create.mockResolvedValue(expectedSkill);

    const result = await service.execute(input);

    expect(result.yearsOfExperience).toBeNull();
  });

  it('should throw BadRequestException when category not found', async () => {
    const input = {
      name: 'TypeScript',
      categoryId: 'non-existent',
      proficiency: ProficiencyLevel.ADVANCED,
      isHighlighted: true,
    };

    categoryRepo.findById.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    await expect(service.execute(input)).rejects.toThrow(
      "Category with id 'non-existent' not found",
    );

    expect(categoryRepo.findById).toHaveBeenCalledWith('non-existent');
    expect(skillRepo.findByName).not.toHaveBeenCalled();
    expect(skillRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when skill name already exists', async () => {
    const category = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 0,
    });

    const existingSkill = new Skill({
      id: 'skill-1',
      name: 'TypeScript',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.EXPERT,
      yearsOfExperience: 10,
      order: 0,
      isHighlighted: true,
    });

    const input = {
      name: 'TypeScript',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.ADVANCED,
      isHighlighted: true,
    };

    categoryRepo.findById.mockResolvedValue(category);
    skillRepo.findByName.mockResolvedValue(existingSkill);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      "Skill with name 'TypeScript' already exists",
    );

    expect(categoryRepo.findById).toHaveBeenCalledWith('cat-1');
    expect(skillRepo.findByName).toHaveBeenCalledWith('TypeScript');
    expect(skillRepo.create).not.toHaveBeenCalled();
  });

  it('should auto-increment order based on max order', async () => {
    const category = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 0,
    });

    const input = {
      name: 'Python',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.INTERMEDIATE,
      isHighlighted: false,
    };

    categoryRepo.findById.mockResolvedValue(category);
    skillRepo.findByName.mockResolvedValue(null);
    skillRepo.getMaxOrder.mockResolvedValue(42);
    skillRepo.create.mockImplementation((skill) => Promise.resolve(skill));

    await service.execute(input);

    expect(skillRepo.getMaxOrder).toHaveBeenCalled();
    expect(skillRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 43,
      }),
    );
  });

  it('should set order to 1 when no skills exist', async () => {
    const category = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 0,
    });

    const input = {
      name: 'JavaScript',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.EXPERT,
      isHighlighted: true,
    };

    categoryRepo.findById.mockResolvedValue(category);
    skillRepo.findByName.mockResolvedValue(null);
    skillRepo.getMaxOrder.mockResolvedValue(0);
    skillRepo.create.mockImplementation((skill) => Promise.resolve(skill));

    await service.execute(input);

    expect(skillRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 1,
      }),
    );
  });
});
