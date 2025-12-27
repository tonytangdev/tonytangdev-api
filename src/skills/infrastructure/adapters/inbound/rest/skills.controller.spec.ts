import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { GetSkillsUseCase } from '../../../../application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from '../../../../application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from '../../../../application/ports/inbound/get-highlighted-skills.use-case';
import { CreateSkillUseCase } from '../../../../application/ports/inbound/create-skill.use-case';
import { CreateSkillCategoryUseCase } from '../../../../application/ports/inbound/create-skill-category.use-case';
import { UpdateSkillUseCase } from '../../../../application/ports/inbound/update-skill.use-case';
import { UpdateSkillCategoryUseCase } from '../../../../application/ports/inbound/update-skill-category.use-case';
import { SkillMapper } from '../mappers/skill.mapper';
import { Skill } from '../../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../../../domain/value-objects/proficiency-level.vo';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('SkillsController', () => {
  let controller: SkillsController;
  let getSkillsUseCase: jest.Mocked<GetSkillsUseCase>;
  let getSkillsByCategoryUseCase: jest.Mocked<GetSkillsByCategoryUseCase>;
  let getHighlightedSkillsUseCase: jest.Mocked<GetHighlightedSkillsUseCase>;
  let createSkillUseCase: jest.Mocked<CreateSkillUseCase>;
  let createSkillCategoryUseCase: jest.Mocked<CreateSkillCategoryUseCase>;

  beforeEach(async () => {
    const mockGetSkillsUseCase = {
      execute: jest.fn(),
    };

    const mockGetSkillsByCategoryUseCase = {
      execute: jest.fn(),
    };

    const mockGetHighlightedSkillsUseCase = {
      execute: jest.fn(),
    };

    const mockCreateSkillUseCase = {
      execute: jest.fn(),
    };

    const mockCreateSkillCategoryUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateSkillUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateSkillCategoryUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        { provide: GetSkillsUseCase, useValue: mockGetSkillsUseCase },
        {
          provide: GetSkillsByCategoryUseCase,
          useValue: mockGetSkillsByCategoryUseCase,
        },
        {
          provide: GetHighlightedSkillsUseCase,
          useValue: mockGetHighlightedSkillsUseCase,
        },
        { provide: CreateSkillUseCase, useValue: mockCreateSkillUseCase },
        {
          provide: CreateSkillCategoryUseCase,
          useValue: mockCreateSkillCategoryUseCase,
        },
        { provide: UpdateSkillUseCase, useValue: mockUpdateSkillUseCase },
        {
          provide: UpdateSkillCategoryUseCase,
          useValue: mockUpdateSkillCategoryUseCase,
        },
        SkillMapper,
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SkillsController>(SkillsController);
    getSkillsUseCase = module.get(GetSkillsUseCase);
    getSkillsByCategoryUseCase = module.get(GetSkillsByCategoryUseCase);
    getHighlightedSkillsUseCase = module.get(GetHighlightedSkillsUseCase);
    createSkillUseCase = module.get(CreateSkillUseCase);
    createSkillCategoryUseCase = module.get(CreateSkillCategoryUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSkills', () => {
    it('should return grouped skills', async () => {
      const category = new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      });
      const skill = new Skill({
        id: '1',
        name: 'TypeScript',
        categoryId: '1',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 5,
        order: 0,
        isHighlighted: true,
      });
      const grouped = new Map([[category, [skill]]]);

      getSkillsUseCase.execute.mockResolvedValue(grouped);

      const result = await controller.getSkills();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Languages');
      expect(result.data[0].skills).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getCategories', () => {
    it('should return all categories with skills', async () => {
      const category = new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      });
      const skill = new Skill({
        id: '1',
        name: 'TypeScript',
        categoryId: '1',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 5,
        order: 0,
        isHighlighted: true,
      });
      const grouped = new Map([[category, [skill]]]);

      getSkillsUseCase.execute.mockResolvedValue(grouped);

      const result = await controller.getCategories();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getSkillsByCategory', () => {
    it('should return skills for specific category', async () => {
      const category = new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      });
      const skills = [
        new Skill({
          id: '1',
          name: 'TypeScript',
          categoryId: '1',
          proficiency: ProficiencyLevel.EXPERT,
          yearsOfExperience: 5,
          order: 0,
          isHighlighted: true,
        }),
      ];

      getSkillsByCategoryUseCase.execute.mockResolvedValue({
        category,
        skills,
      });

      const result = await controller.getSkillsByCategory('languages');

      expect(result.data.name).toBe('Languages');
      expect(result.data.skills).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw NotFoundException when category not found', async () => {
      getSkillsByCategoryUseCase.execute.mockResolvedValue(null);

      await expect(
        controller.getSkillsByCategory('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHighlightedSkills', () => {
    it('should return highlighted skills', async () => {
      const skills = [
        new Skill({
          id: '1',
          name: 'TypeScript',
          categoryId: '1',
          proficiency: ProficiencyLevel.EXPERT,
          yearsOfExperience: 5,
          order: 0,
          isHighlighted: true,
        }),
        new Skill({
          id: '2',
          name: 'NestJS',
          categoryId: '2',
          proficiency: ProficiencyLevel.EXPERT,
          yearsOfExperience: 4,
          order: 0,
          isHighlighted: true,
        }),
      ];

      getHighlightedSkillsUseCase.execute.mockResolvedValue(skills);

      const result = await controller.getHighlightedSkills();

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should return empty array when no highlighted skills', async () => {
      getHighlightedSkillsUseCase.execute.mockResolvedValue([]);

      const result = await controller.getHighlightedSkills();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('createSkill', () => {
    it('should create a skill and return response', async () => {
      const dto = {
        name: 'Rust',
        categoryId: '1',
        proficiency: ProficiencyLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        isHighlighted: true,
      };

      const createdSkill = new Skill({
        id: 'skill-123',
        name: 'Rust',
        categoryId: '1',
        proficiency: ProficiencyLevel.INTERMEDIATE,
        yearsOfExperience: 2,
        order: 5,
        isHighlighted: true,
      });

      createSkillUseCase.execute.mockResolvedValue(createdSkill);

      const result = await controller.createSkill(dto);

      expect(createSkillUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('id', 'skill-123');
      expect(result.data).toHaveProperty('name', 'Rust');
      expect(result.data).toHaveProperty(
        'proficiency',
        ProficiencyLevel.INTERMEDIATE,
      );
      expect(result.data).toHaveProperty('isHighlighted', true);
      expect(result.meta).toEqual({});
    });

    it('should create skill without yearsOfExperience', async () => {
      const dto = {
        name: 'Go',
        categoryId: '1',
        proficiency: ProficiencyLevel.BEGINNER,
        isHighlighted: false,
      };

      const createdSkill = new Skill({
        id: 'skill-456',
        name: 'Go',
        categoryId: '1',
        proficiency: ProficiencyLevel.BEGINNER,
        yearsOfExperience: null,
        order: 6,
        isHighlighted: false,
      });

      createSkillUseCase.execute.mockResolvedValue(createdSkill);

      const result = await controller.createSkill(dto);

      expect(createSkillUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data.yearsOfExperience).toBeNull();
    });

    it('should handle all proficiency levels', async () => {
      const proficiencyLevels = [
        ProficiencyLevel.BEGINNER,
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
        ProficiencyLevel.EXPERT,
      ];

      for (const proficiency of proficiencyLevels) {
        const dto = {
          name: `Skill-${proficiency}`,
          categoryId: '1',
          proficiency,
          isHighlighted: false,
        };

        const createdSkill = new Skill({
          id: `skill-${proficiency}`,
          name: `Skill-${proficiency}`,
          categoryId: '1',
          proficiency,
          yearsOfExperience: null,
          order: 1,
          isHighlighted: false,
        });

        createSkillUseCase.execute.mockResolvedValue(createdSkill);

        const result = await controller.createSkill(dto);

        expect(result.data.proficiency).toBe(proficiency);
      }
    });
  });

  describe('createCategory', () => {
    it('should create a category and return response', async () => {
      const dto = {
        name: 'Cloud Platforms',
      };

      const createdCategory = new SkillCategory({
        id: 'cat-123',
        name: 'Cloud Platforms',
        slug: 'cloud-platforms',
        order: 4,
      });

      createSkillCategoryUseCase.execute.mockResolvedValue(createdCategory);

      const result = await controller.createCategory(dto);

      expect(createSkillCategoryUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('id', 'cat-123');
      expect(result.data).toHaveProperty('name', 'Cloud Platforms');
      expect(result.data).toHaveProperty('slug', 'cloud-platforms');
      expect(result.data).toHaveProperty('skills');
      expect(result.data.skills).toEqual([]);
      expect(result.meta).toEqual({});
    });

    it('should return category with empty skills array', async () => {
      const dto = {
        name: 'Testing Frameworks',
      };

      const createdCategory = new SkillCategory({
        id: 'cat-456',
        name: 'Testing Frameworks',
        slug: 'testing-frameworks',
        order: 5,
      });

      createSkillCategoryUseCase.execute.mockResolvedValue(createdCategory);

      const result = await controller.createCategory(dto);

      expect(result.data.skills).toBeInstanceOf(Array);
      expect(result.data.skills).toHaveLength(0);
    });

    it('should handle category names with special characters', async () => {
      const dto = {
        name: 'DevOps & CI/CD',
      };

      const createdCategory = new SkillCategory({
        id: 'cat-789',
        name: 'DevOps & CI/CD',
        slug: 'devops--cicd',
        order: 6,
      });

      createSkillCategoryUseCase.execute.mockResolvedValue(createdCategory);

      const result = await controller.createCategory(dto);

      expect(createSkillCategoryUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data.slug).toBe('devops--cicd');
    });
  });
});
