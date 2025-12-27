import { Education } from '../entities/education.entity';

export class EducationSortingService {
  sortByOrder(educations: Education[]): Education[] {
    return [...educations].sort((a, b) => a.order - b.order);
  }

  sortByDate(educations: Education[]): Education[] {
    return [...educations].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  }
}
