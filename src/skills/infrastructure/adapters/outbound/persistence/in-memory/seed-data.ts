import { Skill } from '../../../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../../../../domain/value-objects/proficiency-level.vo';

export const seedCategories: SkillCategory[] = [
  new SkillCategory('1', 'Programming Languages', 'programming-languages', 0),
  new SkillCategory('2', 'Frameworks & Libraries', 'frameworks-libraries', 1),
  new SkillCategory('3', 'Tools & Platforms', 'tools-platforms', 2),
];

export const seedSkills: Skill[] = [
  // Programming Languages
  new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
  new Skill('2', 'JavaScript', '1', ProficiencyLevel.EXPERT, 7, 1, true),
  new Skill('3', 'Python', '1', ProficiencyLevel.ADVANCED, 3, 2, false),
  new Skill('4', 'Go', '1', ProficiencyLevel.INTERMEDIATE, 2, 3, false),

  // Frameworks & Libraries
  new Skill('5', 'NestJS', '2', ProficiencyLevel.EXPERT, 4, 0, true),
  new Skill('6', 'React', '2', ProficiencyLevel.ADVANCED, 5, 1, true),
  new Skill('7', 'Node.js', '2', ProficiencyLevel.EXPERT, 6, 2, true),
  new Skill('8', 'Express', '2', ProficiencyLevel.ADVANCED, 5, 3, false),

  // Tools & Platforms
  new Skill('9', 'Docker', '3', ProficiencyLevel.ADVANCED, 4, 0, true),
  new Skill('10', 'Git', '3', ProficiencyLevel.EXPERT, 7, 1, false),
  new Skill('11', 'PostgreSQL', '3', ProficiencyLevel.ADVANCED, 5, 2, false),
  new Skill('12', 'AWS', '3', ProficiencyLevel.INTERMEDIATE, 3, 3, false),
];
