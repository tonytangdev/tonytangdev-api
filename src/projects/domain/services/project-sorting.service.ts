import { Project } from '../entities/project.entity';

export class ProjectSortingService {
  sortByOrder(projects: Project[]): Project[] {
    return [...projects].sort((a, b) => a.order - b.order);
  }
}
