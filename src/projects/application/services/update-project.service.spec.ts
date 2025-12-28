import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateProjectService } from './update-project.service';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

describe('UpdateProjectService', () => {
  let service: UpdateProjectService;
  let projectRepo: jest.Mocked<ProjectRepositoryPort>;

  beforeEach(async () => {
    const mockProjectRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTechnology: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByName: jest.fn(),
      findByNameExcludingId: jest.fn(),
      getMaxOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProjectService,
        { provide: ProjectRepositoryPort, useValue: mockProjectRepo },
      ],
    }).compile();

    service = module.get<UpdateProjectService>(UpdateProjectService);
    projectRepo = module.get(ProjectRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update project with all fields', async () => {
    const existingProject = new Project({
      id: 'proj-1',
      name: 'Old Name',
      description: 'Old description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['React'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 5,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-1',
      name: 'Updated Project',
      description: 'Updated description',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-30'),
      technologies: ['TypeScript', 'React', 'Node.js'],
      repositoryLink: 'https://github.com/user/project',
      demoLink: 'https://demo.project.com',
      websiteLink: 'https://project.com',
      achievements: ['Achievement 1', 'Achievement 2'],
      isHighlighted: true,
    };

    const expectedProject = new Project({
      id: 'proj-1',
      name: 'Updated Project',
      description: 'Updated description',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-30'),
      technologies: ['TypeScript', 'React', 'Node.js'],
      repositoryLink: 'https://github.com/user/project',
      demoLink: 'https://demo.project.com',
      websiteLink: 'https://project.com',
      achievements: ['Achievement 1', 'Achievement 2'],
      order: 5,
      isHighlighted: true,
    });

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(null);
    projectRepo.update.mockResolvedValue(expectedProject);

    const result = await service.execute(input);

    expect(projectRepo.findById).toHaveBeenCalledWith('proj-1');
    expect(projectRepo.findByNameExcludingId).toHaveBeenCalledWith(
      'Updated Project',
      'proj-1',
    );
    expect(projectRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'proj-1',
        name: 'Updated Project',
        description: 'Updated description',
        technologies: ['TypeScript', 'React', 'Node.js'],
        isHighlighted: true,
        order: 5,
      }),
    );
    expect(result).toEqual(expectedProject);
  });

  it('should update project with minimal fields', async () => {
    const existingProject = new Project({
      id: 'proj-2',
      name: 'Minimal Project',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['Vue.js'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 3,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-2',
      name: 'Updated Minimal',
      description: 'Updated description',
      startDate: new Date('2024-03-01'),
      technologies: ['Angular'],
      isHighlighted: false,
    };

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(null);
    projectRepo.update.mockImplementation((project) =>
      Promise.resolve(project),
    );

    const result = await service.execute(input);

    expect(result.endDate).toBeNull();
    expect(result.repositoryLink).toBeNull();
    expect(result.demoLink).toBeNull();
    expect(result.websiteLink).toBeNull();
    expect(result.achievements).toEqual([]);
  });

  it('should preserve order field', async () => {
    const existingProject = new Project({
      id: 'proj-3',
      name: 'Test Project',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['Python'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 42,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-3',
      name: 'Updated Test',
      description: 'New description',
      startDate: new Date('2024-04-01'),
      technologies: ['Python', 'FastAPI'],
      isHighlighted: true,
    };

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(null);
    projectRepo.update.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 42,
      }),
    );
  });

  it('should throw NotFoundException when project not found', async () => {
    const input = {
      id: 'non-existent-id',
      name: 'Test',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      technologies: ['Java'],
      isHighlighted: false,
    };

    projectRepo.findById.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toThrow(NotFoundException);
    await expect(service.execute(input)).rejects.toThrow(
      "Project with id 'non-existent-id' not found",
    );

    expect(projectRepo.findById).toHaveBeenCalledWith('non-existent-id');
    expect(projectRepo.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException on duplicate name (different project)', async () => {
    const existingProject = new Project({
      id: 'proj-4',
      name: 'Original Name',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['Go'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 1,
      isHighlighted: false,
    });

    const duplicateProject = new Project({
      id: 'proj-5',
      name: 'Taken Name',
      description: 'Another description',
      startDate: new Date('2024-02-01'),
      endDate: null,
      technologies: ['Rust'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 2,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-4',
      name: 'Taken Name',
      description: 'Trying to use taken name',
      startDate: new Date('2024-03-01'),
      technologies: ['Go'],
      isHighlighted: false,
    };

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(duplicateProject);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      "Project with name 'Taken Name' already exists",
    );

    expect(projectRepo.update).not.toHaveBeenCalled();
  });

  it('should allow same name for same project (idempotent update)', async () => {
    const existingProject = new Project({
      id: 'proj-6',
      name: 'Same Name',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['Kotlin'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 7,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-6',
      name: 'Same Name',
      description: 'Updated description',
      startDate: new Date('2024-01-01'),
      technologies: ['Kotlin', 'Spring Boot'],
      isHighlighted: true,
    };

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(null);
    projectRepo.update.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.findByNameExcludingId).toHaveBeenCalledWith(
      'Same Name',
      'proj-6',
    );
    expect(projectRepo.update).toHaveBeenCalled();
  });

  it('should update isHighlighted field', async () => {
    const existingProject = new Project({
      id: 'proj-7',
      name: 'Highlight Test',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['Swift'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 8,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-7',
      name: 'Highlight Test',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      technologies: ['Swift'],
      isHighlighted: true,
    };

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(null);
    projectRepo.update.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        isHighlighted: true,
      }),
    );
  });

  it('should handle date string to Date conversion', async () => {
    const existingProject = new Project({
      id: 'proj-8',
      name: 'Date Test',
      description: 'Description',
      startDate: new Date('2024-01-01'),
      endDate: null,
      technologies: ['PHP'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 9,
      isHighlighted: false,
    });

    const input = {
      id: 'proj-8',
      name: 'Date Test',
      description: 'Description',
      startDate: '2024-05-15',
      endDate: '2024-12-31',
      technologies: ['PHP', 'Laravel'],
      isHighlighted: false,
    };

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.findByNameExcludingId.mockResolvedValue(null);
    projectRepo.update.mockImplementation((project) =>
      Promise.resolve(project),
    );

    await service.execute(input);

    expect(projectRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-12-31'),
      }),
    );
  });
});
