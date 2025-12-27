import { SkillGroupingService } from './skill-grouping.service';
import { Skill } from '../entities/skill.entity';
import { SkillCategory } from '../entities/skill-category.entity';
import { ProficiencyLevel } from '../value-objects/proficiency-level.vo';

describe('SkillGroupingService', () => {
  let service: SkillGroupingService;

  beforeEach(() => {
    service = new SkillGroupingService();
  });

  it('should group skills by category', () => {
    const categories = [
      new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      }),
      new SkillCategory({
        id: '2',
        name: 'Frameworks',
        slug: 'frameworks',
        order: 1,
      }),
    ];

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
        name: 'JavaScript',
        categoryId: '1',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 7,
        order: 1,
        isHighlighted: true,
      }),
      new Skill({
        id: '3',
        name: 'NestJS',
        categoryId: '2',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 4,
        order: 0,
        isHighlighted: true,
      }),
    ];

    const result = service.groupByCategory(categories, skills);

    expect(result.size).toBe(2);
    const languageSkills = result.get(categories[0]);
    const frameworkSkills = result.get(categories[1]);

    expect(languageSkills).toHaveLength(2);
    expect(frameworkSkills).toHaveLength(1);
    expect(languageSkills![0].name).toBe('TypeScript');
    expect(frameworkSkills![0].name).toBe('NestJS');
  });

  it('should sort categories by order', () => {
    const categories = [
      new SkillCategory({ id: '1', name: 'B Category', slug: 'b', order: 1 }),
      new SkillCategory({ id: '2', name: 'A Category', slug: 'a', order: 0 }),
    ];

    const skills: Skill[] = [];

    const result = service.groupByCategory(categories, skills);

    const keys = Array.from(result.keys());
    expect(keys[0].name).toBe('A Category');
    expect(keys[1].name).toBe('B Category');
  });

  it('should sort skills within category by order', () => {
    const categories = [
      new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      }),
    ];

    const skills = [
      new Skill({
        id: '2',
        name: 'JavaScript',
        categoryId: '1',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 7,
        order: 1,
        isHighlighted: true,
      }),
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
        id: '3',
        name: 'Python',
        categoryId: '1',
        proficiency: ProficiencyLevel.ADVANCED,
        yearsOfExperience: 3,
        order: 2,
        isHighlighted: false,
      }),
    ];

    const result = service.groupByCategory(categories, skills);

    const languageSkills = result.get(categories[0]);
    expect(languageSkills![0].name).toBe('TypeScript');
    expect(languageSkills![1].name).toBe('JavaScript');
    expect(languageSkills![2].name).toBe('Python');
  });

  it('should handle skills without matching category', () => {
    const categories = [
      new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      }),
    ];

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
        categoryId: '999',
        proficiency: ProficiencyLevel.EXPERT,
        yearsOfExperience: 4,
        order: 0,
        isHighlighted: true,
      }),
    ];

    const result = service.groupByCategory(categories, skills);

    const languageSkills = result.get(categories[0]);
    expect(languageSkills).toHaveLength(1);
    expect(languageSkills![0].name).toBe('TypeScript');
  });

  it('should handle empty categories', () => {
    const categories = [
      new SkillCategory({
        id: '1',
        name: 'Languages',
        slug: 'languages',
        order: 0,
      }),
    ];
    const skills: Skill[] = [];

    const result = service.groupByCategory(categories, skills);

    expect(result.size).toBe(1);
    expect(result.get(categories[0])).toEqual([]);
  });

  it('should handle empty skills', () => {
    const categories: SkillCategory[] = [];
    const skills: Skill[] = [];

    const result = service.groupByCategory(categories, skills);

    expect(result.size).toBe(0);
  });
});
