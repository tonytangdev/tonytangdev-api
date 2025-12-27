import { Skill } from '../../../../../domain/entities/skill.entity';
import { SkillCategory } from '../../../../../domain/entities/skill-category.entity';
import { ProficiencyLevel } from '../../../../../domain/value-objects/proficiency-level.vo';

export const seedCategories: SkillCategory[] = [
  new SkillCategory({
    id: '1',
    name: 'Programming Languages',
    slug: 'programming-languages',
    order: 0,
  }),
  new SkillCategory({
    id: '2',
    name: 'Frameworks & Libraries',
    slug: 'frameworks-libraries',
    order: 1,
  }),
  new SkillCategory({
    id: '3',
    name: 'Tools & Platforms',
    slug: 'tools-platforms',
    order: 2,
  }),
];

export const seedSkills: Skill[] = [
  // Programming Languages
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
    name: 'Python',
    categoryId: '1',
    proficiency: ProficiencyLevel.ADVANCED,
    yearsOfExperience: 3,
    order: 2,
    isHighlighted: false,
  }),
  new Skill({
    id: '4',
    name: 'Go',
    categoryId: '1',
    proficiency: ProficiencyLevel.INTERMEDIATE,
    yearsOfExperience: 2,
    order: 3,
    isHighlighted: false,
  }),

  // Frameworks & Libraries
  new Skill({
    id: '5',
    name: 'NestJS',
    categoryId: '2',
    proficiency: ProficiencyLevel.EXPERT,
    yearsOfExperience: 4,
    order: 0,
    isHighlighted: true,
  }),
  new Skill({
    id: '6',
    name: 'React',
    categoryId: '2',
    proficiency: ProficiencyLevel.ADVANCED,
    yearsOfExperience: 5,
    order: 1,
    isHighlighted: true,
  }),
  new Skill({
    id: '7',
    name: 'Node.js',
    categoryId: '2',
    proficiency: ProficiencyLevel.EXPERT,
    yearsOfExperience: 6,
    order: 2,
    isHighlighted: true,
  }),
  new Skill({
    id: '8',
    name: 'Express',
    categoryId: '2',
    proficiency: ProficiencyLevel.ADVANCED,
    yearsOfExperience: 5,
    order: 3,
    isHighlighted: false,
  }),

  // Tools & Platforms
  new Skill({
    id: '9',
    name: 'Docker',
    categoryId: '3',
    proficiency: ProficiencyLevel.ADVANCED,
    yearsOfExperience: 4,
    order: 0,
    isHighlighted: true,
  }),
  new Skill({
    id: '10',
    name: 'Git',
    categoryId: '3',
    proficiency: ProficiencyLevel.EXPERT,
    yearsOfExperience: 7,
    order: 1,
    isHighlighted: false,
  }),
  new Skill({
    id: '11',
    name: 'PostgreSQL',
    categoryId: '3',
    proficiency: ProficiencyLevel.ADVANCED,
    yearsOfExperience: 5,
    order: 2,
    isHighlighted: false,
  }),
  new Skill({
    id: '12',
    name: 'AWS',
    categoryId: '3',
    proficiency: ProficiencyLevel.INTERMEDIATE,
    yearsOfExperience: 3,
    order: 3,
    isHighlighted: false,
  }),
];
