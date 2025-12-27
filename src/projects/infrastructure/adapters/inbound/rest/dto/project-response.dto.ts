export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  technologies: string[];
  repositoryLink: string | null;
  demoLink: string | null;
  websiteLink: string | null;
  achievements: string[];
  isHighlighted: boolean;
}
