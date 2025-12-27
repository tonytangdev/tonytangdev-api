import { Experience } from '../../../../../domain/entities/experience.entity';

export const seedExperiences: Experience[] = [
  new Experience({
    id: '1',
    company: 'Tech Innovation Corp',
    title: 'Senior Software Engineer',
    startDate: new Date('2022-01-01'),
    endDate: null,
    description:
      'Leading development of modern web applications using TypeScript, NestJS, and React. Architecting scalable backend systems and mentoring junior developers.',
    technologies: [
      'TypeScript',
      'NestJS',
      'React',
      'PostgreSQL',
      'Docker',
      'AWS',
    ],
    achievements: [
      'Architected and implemented hexagonal architecture pattern for 3 major projects',
      'Reduced API response time by 40% through optimization and caching strategies',
      'Mentored team of 5 junior developers, improving code quality and development practices',
      'Led migration from monolithic to microservices architecture',
    ],
    location: 'San Francisco, CA',
    isCurrent: true,
    isHighlighted: true,
    order: 0,
  }),
  new Experience({
    id: '2',
    company: 'Startup Innovations Inc',
    title: 'Software Engineer',
    startDate: new Date('2020-03-01'),
    endDate: new Date('2021-12-31'),
    description:
      'Full-stack development of SaaS platform serving 10,000+ users. Built features from database to UI, implemented CI/CD pipelines, and maintained production systems.',
    technologies: [
      'JavaScript',
      'Node.js',
      'Vue.js',
      'MongoDB',
      'Redis',
      'Jenkins',
    ],
    achievements: [
      'Built authentication and authorization system from scratch using JWT',
      'Implemented CI/CD pipeline reducing deployment time by 60%',
      'Developed real-time notification system using WebSockets',
      'Reduced database query time by 50% through indexing and optimization',
    ],
    location: 'Remote',
    isCurrent: false,
    isHighlighted: true,
    order: 1,
  }),
  new Experience({
    id: '3',
    company: 'Enterprise Solutions Ltd',
    title: 'Junior Software Developer',
    startDate: new Date('2018-06-01'),
    endDate: new Date('2020-02-28'),
    description:
      'Entry-level position working on internal tools and automation scripts. Collaborated with senior developers to maintain and enhance existing systems.',
    technologies: ['Python', 'Django', 'MySQL', 'JavaScript', 'jQuery'],
    achievements: [
      'Automated manual data processing tasks, saving 10 hours per week',
      'Fixed 50+ bugs and implemented feature enhancements',
      'Developed RESTful APIs for internal tool integration',
    ],
    location: 'New York, NY',
    isCurrent: false,
    isHighlighted: false,
    order: 2,
  }),
];
