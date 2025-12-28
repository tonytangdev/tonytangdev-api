import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateProjectService } from './create-project.service';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

describe('CreateProjectService', () => {
  let service: CreateProjectService;
  let projectRepo: jest.Mocked<ProjectRepositoryPort>;

  beforeEach(async () => {
    const mockProjectRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTechnology: jest.fn(),
      create: jest.fn(),
      findByName: jest.fn(),
      getMaxOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProjectService,
        { provide: ProjectRepositoryPort, useValue: mockProjectRepo },
      ],
    }).compile();

    service = module.get<CreateProjectService>(CreateProjectService);
    projectRepo = module.get(ProjectRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a project with required fields only', async () => {
    const input = {
      name: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform',
      startDate: new Date('2024-01-15'),
      technologies: ['TypeScript', 'React', 'Node.js'],
    };

    const expectedProject = new Project({
      id: expect.any(String),
      name: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform',
      startDate: new Date('2024-01-15'),
      endDate: null,
      technologies: ['TypeScript', 'React', 'Node.js'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 6,
      isHighlighted: false,
    });

    projectRepo.findByName.mockResolvedValue(null);
    projectRepo.getMaxOrder.mockResolvedValue(5);
    projectRepo.create.mockResolvedValue(expectedProject);

    const result = await service.execute(input);

    expect(projectRepo.findByName).toHaveBeenCalledWith('E-commerce Platform');
    expect(projectRepo.getMaxOrder).toHaveBeenCalled();
    expect(projectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'E-commerce Platform',
        description: 'A full-featured e-commerce platform',
        technologies: ['TypeScript', 'React', 'Node.js'],
        endDate: null,
        repositoryLink: null,
        demoLink: null,
        websiteLink: null,
        achievements: [],
        order: 6,
        isHighlighted: false,
      }),
    );
    expect(result).toEqual(expectedProject);
  });

  it('should create a project with all fields', async () => {
    const input = {
      name: 'Portfolio Website',
      description: 'Personal portfolio website with blog',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-12-31'),
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      repositoryLink: 'https://github.com/user/portfolio',
      demoLink: 'https://demo.portfolio.com',
      websiteLink: 'https://portfolio.com',
      achievements: ['Featured on Product Hunt', '1000+ visitors'],
    };

    const expectedProject = new Project({
      id: expect.any(String),
      name: 'Portfolio Website',
      description: 'Personal portfolio website with blog',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-12-31'),
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      repositoryLink: 'https://github.com/user/portfolio',
      demoLink: 'https://demo.portfolio.com',
      websiteLink: 'https://portfolio.com',
      achievements: ['Featured on Product Hunt', '1000+ visitors'],
      order: 1,
      isHighlighted: false,
    });

    projectRepo.findByName.mockResolvedValue(null);
    projectRepo.getMaxOrder.mockResolvedValue(0);
    projectRepo.create.mockResolvedValue(expectedProject);

    const result = await service.execute(input);

    expect(result.endDate).toEqual(new Date('2023-12-31'));
    expect(result.repositoryLink).toBe('https://github.com/user/portfolio');
    expect(result.achievements).toEqual([
      'Featured on Product Hunt',
      '1000+ visitors',
    ]);
  });

  it('should throw ConflictException when project name already exists', async () => {
    const existingProject = new Project({
      id: 'proj-1',
      name: 'Task Manager',
      description: 'A task management application',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['Vue.js'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 1,
      isHighlighted: false,
    });

    const input = {
      name: 'Task Manager',
      description: 'Another task management app',
      startDate: new Date('2024-02-01'),
      technologies: ['React'],
    };

    projectRepo.findByName.mockResolvedValue(existingProject);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      "Project with name 'Task Manager' already exists",
    );

    expect(projectRepo.findByName).toHaveBeenCalledWith('Task Manager');
    expect(projectRepo.create).not.toHaveBeenCalled();
  });

  it('should auto-increment order based on max order', async () => {
    const input = {
      name: 'Weather Dashboard',
      description: 'Real-time weather monitoring',
      startDate: new Date('2024-03-01'),
      technologies: ['React', 'JavaScript'],
    };

    projectRepo.findByName.mockResolvedValue(null);
    projectRepo.getMaxOrder.mockResolvedValue(42);
    projectRepo.create.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.getMaxOrder).toHaveBeenCalled();
    expect(projectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 43,
      }),
    );
  });

  it('should set order to 1 when no projects exist', async () => {
    const input = {
      name: 'Blog Platform',
      description: 'Content management system',
      startDate: new Date('2024-04-01'),
      technologies: ['Next.js', 'MDX'],
    };

    projectRepo.findByName.mockResolvedValue(null);
    projectRepo.getMaxOrder.mockResolvedValue(0);
    projectRepo.create.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 1,
      }),
    );
  });

  it('should set isHighlighted to false by default', async () => {
    const input = {
      name: 'Chat Application',
      description: 'Real-time messaging app',
      startDate: new Date('2024-05-01'),
      technologies: ['Socket.io', 'Express'],
    };

    projectRepo.findByName.mockResolvedValue(null);
    projectRepo.getMaxOrder.mockResolvedValue(3);
    projectRepo.create.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isHighlighted: false,
      }),
    );
  });

  it('should generate UUID for id', async () => {
    const input = {
      name: 'Analytics Dashboard',
      description: 'Data visualization platform',
      startDate: new Date('2024-06-01'),
      technologies: ['D3.js', 'React'],
    };

    projectRepo.findByName.mockResolvedValue(null);
    projectRepo.getMaxOrder.mockResolvedValue(7);
    projectRepo.create.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
      }),
    );
    // Verify it's a UUID-like string
    const createCall = projectRepo.create.mock.calls[0][0];
    expect(createCall.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
