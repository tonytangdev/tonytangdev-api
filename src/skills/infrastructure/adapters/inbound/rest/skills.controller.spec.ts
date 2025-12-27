import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { GetSkillsUseCase } from '../../../../application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from '../../../../application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from '../../../../application/ports/inbound/get-highlighted-skills.use-case';
import { SkillMapper } from '../mappers/skill.mapper';
import { Skill } from '../../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../../../domain/value-objects/proficiency-level.vo';

describe('SkillsController', () => {
  let controller: SkillsController;
  let getSkillsUseCase: jest.Mocked<GetSkillsUseCase>;
  let getSkillsByCategoryUseCase: jest.Mocked<GetSkillsByCategoryUseCase>;
  let getHighlightedSkillsUseCase: jest.Mocked<GetHighlightedSkillsUseCase>;

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
        SkillMapper,
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
    getSkillsUseCase = module.get(GetSkillsUseCase);
    getSkillsByCategoryUseCase = module.get(GetSkillsByCategoryUseCase);
    getHighlightedSkillsUseCase = module.get(GetHighlightedSkillsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSkills', () => {
    it('should return grouped skills', async () => {
      const category = new SkillCategory('1', 'Languages', 'languages', 0);
      const skill = new Skill(
        '1',
        'TypeScript',
        '1',
        ProficiencyLevel.EXPERT,
        5,
        0,
        true,
      );
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
      const category = new SkillCategory('1', 'Languages', 'languages', 0);
      const skill = new Skill(
        '1',
        'TypeScript',
        '1',
        ProficiencyLevel.EXPERT,
        5,
        0,
        true,
      );
      const grouped = new Map([[category, [skill]]]);

      getSkillsUseCase.execute.mockResolvedValue(grouped);

      const result = await controller.getCategories();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getSkillsByCategory', () => {
    it('should return skills for specific category', async () => {
      const category = new SkillCategory('1', 'Languages', 'languages', 0);
      const skills = [
        new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
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
        new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
        new Skill('2', 'NestJS', '2', ProficiencyLevel.EXPERT, 4, 0, true),
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
});
