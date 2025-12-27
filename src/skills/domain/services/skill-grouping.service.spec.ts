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
      new SkillCategory('1', 'Languages', 'languages', 0),
      new SkillCategory('2', 'Frameworks', 'frameworks', 1),
    ];

    const skills = [
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
      new Skill('2', 'JavaScript', '1', ProficiencyLevel.EXPERT, 7, 1, true),
      new Skill('3', 'NestJS', '2', ProficiencyLevel.EXPERT, 4, 0, true),
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
      new SkillCategory('1', 'B Category', 'b', 1),
      new SkillCategory('2', 'A Category', 'a', 0),
    ];

    const skills: Skill[] = [];

    const result = service.groupByCategory(categories, skills);

    const keys = Array.from(result.keys());
    expect(keys[0].name).toBe('A Category');
    expect(keys[1].name).toBe('B Category');
  });

  it('should sort skills within category by order', () => {
    const categories = [new SkillCategory('1', 'Languages', 'languages', 0)];

    const skills = [
      new Skill('2', 'JavaScript', '1', ProficiencyLevel.EXPERT, 7, 1, true),
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
      new Skill('3', 'Python', '1', ProficiencyLevel.ADVANCED, 3, 2, false),
    ];

    const result = service.groupByCategory(categories, skills);

    const languageSkills = result.get(categories[0]);
    expect(languageSkills![0].name).toBe('TypeScript');
    expect(languageSkills![1].name).toBe('JavaScript');
    expect(languageSkills![2].name).toBe('Python');
  });

  it('should handle skills without matching category', () => {
    const categories = [new SkillCategory('1', 'Languages', 'languages', 0)];

    const skills = [
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
      new Skill('2', 'NestJS', '999', ProficiencyLevel.EXPERT, 4, 0, true),
    ];

    const result = service.groupByCategory(categories, skills);

    const languageSkills = result.get(categories[0]);
    expect(languageSkills).toHaveLength(1);
    expect(languageSkills![0].name).toBe('TypeScript');
  });

  it('should handle empty categories', () => {
    const categories = [new SkillCategory('1', 'Languages', 'languages', 0)];
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
