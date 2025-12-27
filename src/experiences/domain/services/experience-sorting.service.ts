import { Experience } from '../entities/experience.entity';

export class ExperienceSortingService {
  sortByOrder(experiences: Experience[]): Experience[] {
    return [...experiences].sort((a, b) => a.order - b.order);
  }
}
