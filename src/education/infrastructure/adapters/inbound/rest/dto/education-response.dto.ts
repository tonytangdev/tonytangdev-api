export class EducationResponseDto {
  id: string;
  institution: string;
  degreeType: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
  location: string;
  status: string;
  isHighlighted: boolean;
}
