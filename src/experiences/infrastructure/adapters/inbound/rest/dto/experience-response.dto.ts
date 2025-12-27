export class ExperienceResponseDto {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies: string[];
  achievements: string[];
  location: string;
  isCurrent: boolean;
  isHighlighted: boolean;
}
