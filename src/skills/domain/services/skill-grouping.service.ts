import { Skill } from '../entities/skill.entity';
import { SkillCategory } from '../entities/skill-category.entity';

export class SkillGroupingService {
  groupByCategory(
    categories: SkillCategory[],
    skills: Skill[],
  ): Map<SkillCategory, Skill[]> {
    const grouped = new Map<SkillCategory, Skill[]>();

    // Sort categories by order
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

    // Initialize map with empty arrays for each category
    sortedCategories.forEach((category) => {
      grouped.set(category, []);
    });

    // Group skills by category
    skills.forEach((skill) => {
      const category = sortedCategories.find((c) => c.id === skill.categoryId);
      if (category) {
        const skillsInCategory = grouped.get(category) || [];
        skillsInCategory.push(skill);
        grouped.set(category, skillsInCategory);
      }
    });

    // Sort skills within each category by order
    grouped.forEach((skillsArray) => {
      skillsArray.sort((a, b) => a.order - b.order);
    });

    return grouped;
  }
}
