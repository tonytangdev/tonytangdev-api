import { Education } from '../../../../../domain/entities/education.entity';
import { DegreeType } from '../../../../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../../../../domain/value-objects/education-status.vo';

export const seedEducations: Education[] = [
  new Education({
    id: '1',
    institution: 'Stanford University',
    degreeType: DegreeType.MASTER,
    fieldOfStudy: 'Computer Science',
    startDate: new Date('2021-09-01'),
    endDate: new Date('2023-05-31'),
    description:
      'Focused on distributed systems, machine learning, and software architecture. Completed thesis on scalable microservices design patterns.',
    achievements: [
      'Published research paper on distributed consensus algorithms',
      'Teaching assistant for Advanced Algorithms course',
      'Led team project adopted by 2 local startups',
    ],
    location: 'Stanford, CA',
    status: EducationStatus.COMPLETED,
    isHighlighted: true,
    order: 0,
  }),
  new Education({
    id: '2',
    institution: 'University of California, Berkeley',
    degreeType: DegreeType.BACHELOR,
    fieldOfStudy: 'Electrical Engineering & Computer Science',
    startDate: new Date('2017-08-20'),
    endDate: new Date('2021-05-10'),
    description:
      'Completed rigorous EECS program with emphasis on systems and software engineering. Developed proficiency in low-level systems programming and web technologies.',
    achievements: [
      'Graduated summa cum laude',
      "Dean's List all 4 years",
      'Internship at Google (Summer 2020)',
      'Led Open Source Software club with 200+ members',
    ],
    location: 'Berkeley, CA',
    status: EducationStatus.COMPLETED,
    isHighlighted: true,
    order: 1,
  }),
  new Education({
    id: '3',
    institution: 'Codecademy',
    degreeType: DegreeType.CERTIFICATE,
    fieldOfStudy: 'Full Stack Web Development',
    startDate: new Date('2024-01-15'),
    endDate: null,
    description:
      'Intensive online bootcamp covering modern web technologies including React, Node.js, databases, and deployment strategies. 500+ hours of hands-on coding.',
    achievements: [
      '85% completion of program',
      'Built 5 full-stack projects',
      'Currently in progress - 2 modules remaining',
    ],
    location: 'Remote',
    status: EducationStatus.IN_PROGRESS,
    isHighlighted: false,
    order: 2,
  }),
  new Education({
    id: '4',
    institution: 'AWS Training',
    degreeType: DegreeType.CERTIFICATE,
    fieldOfStudy: 'AWS Solutions Architect Professional',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2023-06-15'),
    description:
      'Comprehensive certification course covering AWS architecture, security, and best practices. Prepared and passed AWS Certified Solutions Architect - Professional exam.',
    achievements: [
      'AWS Certified Solutions Architect - Professional',
      'Exam score: 92/100',
      'Completed all hands-on labs',
      'Architected 3 production-ready AWS solutions',
    ],
    location: 'Remote',
    status: EducationStatus.COMPLETED,
    isHighlighted: true,
    order: 3,
  }),
];
