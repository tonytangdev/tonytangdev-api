import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { GetProjectsUseCase } from '../../../../application/ports/inbound/get-projects.use-case';
import { GetProjectByIdUseCase } from '../../../../application/ports/inbound/get-project-by-id.use-case';
import { GetProjectsByTechnologyUseCase } from '../../../../application/ports/inbound/get-projects-by-technology.use-case';
import { CreateProjectUseCase } from '../../../../application/ports/inbound/create-project.use-case';
import { UpdateProjectUseCase } from '../../../../application/ports/inbound/update-project.use-case';
import { ProjectMapper } from '../mappers/project.mapper';
import { Project } from '../../../../domain/entities/project.entity';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let getProjectsUseCase: jest.Mocked<GetProjectsUseCase>;
  let getProjectByIdUseCase: jest.Mocked<GetProjectByIdUseCase>;
  let getProjectsByTechnologyUseCase: jest.Mocked<GetProjectsByTechnologyUseCase>;
  let createProjectUseCase: jest.Mocked<CreateProjectUseCase>;
  let updateProjectUseCase: jest.Mocked<UpdateProjectUseCase>;

  beforeEach(async () => {
    const mockGetProjectsUseCase = {
      execute: jest.fn(),
    };

    const mockGetProjectByIdUseCase = {
      execute: jest.fn(),
    };

    const mockGetProjectsByTechnologyUseCase = {
      execute: jest.fn(),
    };

    const mockCreateProjectUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateProjectUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: GetProjectsUseCase, useValue: mockGetProjectsUseCase },
        {
          provide: GetProjectByIdUseCase,
          useValue: mockGetProjectByIdUseCase,
        },
        {
          provide: GetProjectsByTechnologyUseCase,
          useValue: mockGetProjectsByTechnologyUseCase,
        },
        { provide: CreateProjectUseCase, useValue: mockCreateProjectUseCase },
        { provide: UpdateProjectUseCase, useValue: mockUpdateProjectUseCase },
        ProjectMapper,
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    getProjectsUseCase = module.get(GetProjectsUseCase);
    getProjectByIdUseCase = module.get(GetProjectByIdUseCase);
    getProjectsByTechnologyUseCase = module.get(GetProjectsByTechnologyUseCase);
    createProjectUseCase = module.get(CreateProjectUseCase);
    updateProjectUseCase = module.get(UpdateProjectUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a project and return response', async () => {
      const dto = {
        name: 'E-commerce Platform',
        description: 'A full-featured e-commerce platform',
        startDate: '2024-01-15',
        technologies: ['TypeScript', 'React', 'Node.js'],
      };

      const createdProject = new Project({
        id: 'proj-123',
        name: 'E-commerce Platform',
        description: 'A full-featured e-commerce platform',
        startDate: new Date('2024-01-15'),
        endDate: null,
        technologies: ['TypeScript', 'React', 'Node.js'],
        repositoryLink: null,
        demoLink: null,
        websiteLink: null,
        achievements: [],
        order: 5,
        isHighlighted: false,
      });

      createProjectUseCase.execute.mockResolvedValue(createdProject);

      const result = await controller.createProject(dto);

      expect(createProjectUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('id', 'proj-123');
      expect(result.data).toHaveProperty('name', 'E-commerce Platform');
      expect(result.data).toHaveProperty(
        'description',
        'A full-featured e-commerce platform',
      );
      expect(result.data).toHaveProperty('technologies');
      expect(result.data.technologies).toContain('TypeScript');
      expect(result.meta).toEqual({});
    });

    it('should create project with all fields', async () => {
      const dto = {
        name: 'Portfolio Website',
        description: 'Personal portfolio with blog',
        startDate: '2023-06-01',
        endDate: '2023-12-31',
        technologies: ['Next.js', 'TypeScript'],
        repositoryLink: 'https://github.com/user/portfolio',
        demoLink: 'https://demo.portfolio.com',
        websiteLink: 'https://portfolio.com',
        achievements: ['Featured on Product Hunt', '1000+ visitors'],
      };

      const createdProject = new Project({
        id: 'proj-456',
        name: 'Portfolio Website',
        description: 'Personal portfolio with blog',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
        technologies: ['Next.js', 'TypeScript'],
        repositoryLink: 'https://github.com/user/portfolio',
        demoLink: 'https://demo.portfolio.com',
        websiteLink: 'https://portfolio.com',
        achievements: ['Featured on Product Hunt', '1000+ visitors'],
        order: 1,
        isHighlighted: false,
      });

      createProjectUseCase.execute.mockResolvedValue(createdProject);

      const result = await controller.createProject(dto);

      expect(createProjectUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('repositoryLink');
      expect(result.data.repositoryLink).toBe(
        'https://github.com/user/portfolio',
      );
      expect(result.data).toHaveProperty('achievements');
      expect(result.data.achievements).toEqual([
        'Featured on Product Hunt',
        '1000+ visitors',
      ]);
    });

    it('should handle project with only required fields', async () => {
      const dto = {
        name: 'Minimal Project',
        description: 'A minimal project setup',
        startDate: '2024-03-01',
        technologies: ['JavaScript'],
      };

      const createdProject = new Project({
        id: 'proj-789',
        name: 'Minimal Project',
        description: 'A minimal project setup',
        startDate: new Date('2024-03-01'),
        endDate: null,
        technologies: ['JavaScript'],
        repositoryLink: null,
        demoLink: null,
        websiteLink: null,
        achievements: [],
        order: 2,
        isHighlighted: false,
      });

      createProjectUseCase.execute.mockResolvedValue(createdProject);

      const result = await controller.createProject(dto);

      expect(result.data.endDate).toBeNull();
      expect(result.data.repositoryLink).toBeNull();
      expect(result.data.demoLink).toBeNull();
      expect(result.data.websiteLink).toBeNull();
    });

    it('should map domain entity to response DTO correctly', async () => {
      const dto = {
        name: 'API Service',
        description: 'RESTful API service',
        startDate: '2024-02-01',
        technologies: ['NestJS', 'PostgreSQL'],
      };

      const createdProject = new Project({
        id: 'proj-999',
        name: 'API Service',
        description: 'RESTful API service',
        startDate: new Date('2024-02-01'),
        endDate: null,
        technologies: ['NestJS', 'PostgreSQL'],
        repositoryLink: null,
        demoLink: null,
        websiteLink: null,
        achievements: [],
        order: 3,
        isHighlighted: false,
      });

      createProjectUseCase.execute.mockResolvedValue(createdProject);

      const result = await controller.createProject(dto);

      // Verify response structure
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({});

      // Verify data properties
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('startDate');
      expect(result.data).toHaveProperty('technologies');
    });
  });

  describe('getProjects', () => {
    it('should return all projects with total count', async () => {
      const projects = [
        new Project({
          id: 'proj-1',
          name: 'Project A',
          description: 'Description A',
          startDate: new Date('2024-01-01'),
          endDate: null,
          technologies: ['TypeScript'],
          repositoryLink: null,
          demoLink: null,
          websiteLink: null,
          achievements: [],
          order: 1,
          isHighlighted: false,
        }),
        new Project({
          id: 'proj-2',
          name: 'Project B',
          description: 'Description B',
          startDate: new Date('2024-02-01'),
          endDate: null,
          technologies: ['React'],
          repositoryLink: null,
          demoLink: null,
          websiteLink: null,
          achievements: [],
          order: 2,
          isHighlighted: false,
        }),
      ];

      getProjectsUseCase.execute.mockResolvedValue(projects);

      const result = await controller.getProjects();

      expect(getProjectsUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ total: 2 });
      expect(result.data[0]).toHaveProperty('id', 'proj-1');
      expect(result.data[1]).toHaveProperty('id', 'proj-2');
    });

    it('should return empty array when no projects exist', async () => {
      getProjectsUseCase.execute.mockResolvedValue([]);

      const result = await controller.getProjects();

      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual({ total: 0 });
    });
  });

  describe('getProjectById', () => {
    it('should return a project by id', async () => {
      const project = new Project({
        id: 'proj-123',
        name: 'Test Project',
        description: 'Test Description',
        startDate: new Date('2024-01-01'),
        endDate: null,
        technologies: ['TypeScript', 'NestJS'],
        repositoryLink: 'https://github.com/test/repo',
        demoLink: null,
        websiteLink: null,
        achievements: ['Achievement 1'],
        order: 1,
        isHighlighted: true,
      });

      getProjectByIdUseCase.execute.mockResolvedValue(project);

      const result = await controller.getProjectById('proj-123');

      expect(getProjectByIdUseCase.execute).toHaveBeenCalledWith('proj-123');
      expect(result.data).toHaveProperty('id', 'proj-123');
      expect(result.data).toHaveProperty('name', 'Test Project');
      expect(result.data).toHaveProperty('technologies');
      expect(result.data.technologies).toContain('TypeScript');
      expect(result.meta).toEqual({});
    });

    it('should throw NotFoundException when project not found', async () => {
      getProjectByIdUseCase.execute.mockResolvedValue(null);

      await expect(controller.getProjectById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getProjectById('nonexistent')).rejects.toThrow(
        "Project with id 'nonexistent' not found",
      );
    });
  });

  describe('getProjectsByTechnology', () => {
    it('should return projects filtered by technology', async () => {
      const projects = [
        new Project({
          id: 'proj-1',
          name: 'TypeScript Project',
          description: 'A TypeScript project',
          startDate: new Date('2024-01-01'),
          endDate: null,
          technologies: ['TypeScript', 'Node.js'],
          repositoryLink: null,
          demoLink: null,
          websiteLink: null,
          achievements: [],
          order: 1,
          isHighlighted: false,
        }),
        new Project({
          id: 'proj-2',
          name: 'Another TypeScript Project',
          description: 'Another project with TypeScript',
          startDate: new Date('2024-02-01'),
          endDate: null,
          technologies: ['TypeScript', 'React'],
          repositoryLink: null,
          demoLink: null,
          websiteLink: null,
          achievements: [],
          order: 2,
          isHighlighted: false,
        }),
      ];

      getProjectsByTechnologyUseCase.execute.mockResolvedValue(projects);

      const result = await controller.getProjectsByTechnology('typescript');

      expect(getProjectsByTechnologyUseCase.execute).toHaveBeenCalledWith(
        'typescript',
      );
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ total: 2 });
      expect(result.data[0].technologies).toContain('TypeScript');
      expect(result.data[1].technologies).toContain('TypeScript');
    });

    it('should return empty array when no projects match technology', async () => {
      getProjectsByTechnologyUseCase.execute.mockResolvedValue([]);

      const result = await controller.getProjectsByTechnology('rust');

      expect(getProjectsByTechnologyUseCase.execute).toHaveBeenCalledWith(
        'rust',
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual({ total: 0 });
    });
  });

  describe('updateProject', () => {
    it('should update a project and return response', async () => {
      const dto = {
        name: 'Updated Project',
        description: 'Updated description',
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        technologies: ['TypeScript', 'React'],
        repositoryLink: 'https://github.com/user/updated',
        demoLink: 'https://demo.updated.com',
        websiteLink: 'https://updated.com',
        achievements: ['Achievement 1'],
        isHighlighted: true,
      };

      const updatedProject = new Project({
        id: 'proj-123',
        name: 'Updated Project',
        description: 'Updated description',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
        technologies: ['TypeScript', 'React'],
        repositoryLink: 'https://github.com/user/updated',
        demoLink: 'https://demo.updated.com',
        websiteLink: 'https://updated.com',
        achievements: ['Achievement 1'],
        order: 5,
        isHighlighted: true,
      });

      updateProjectUseCase.execute.mockResolvedValue(updatedProject);

      const result = await controller.updateProject('proj-123', dto);

      expect(updateProjectUseCase.execute).toHaveBeenCalledWith({
        id: 'proj-123',
        ...dto,
      });
      expect(result.data).toHaveProperty('id', 'proj-123');
      expect(result.data).toHaveProperty('name', 'Updated Project');
      expect(result.data).toHaveProperty('isHighlighted', true);
      expect(result.meta).toEqual({});
    });

    it('should update project with minimal fields', async () => {
      const dto = {
        name: 'Minimal Update',
        description: 'Updated description',
        startDate: '2024-03-01',
        technologies: ['Vue.js'],
        isHighlighted: false,
      };

      const updatedProject = new Project({
        id: 'proj-456',
        name: 'Minimal Update',
        description: 'Updated description',
        startDate: new Date('2024-03-01'),
        endDate: null,
        technologies: ['Vue.js'],
        repositoryLink: null,
        demoLink: null,
        websiteLink: null,
        achievements: [],
        order: 2,
        isHighlighted: false,
      });

      updateProjectUseCase.execute.mockResolvedValue(updatedProject);

      const result = await controller.updateProject('proj-456', dto);

      expect(result.data.endDate).toBeNull();
      expect(result.data.repositoryLink).toBeNull();
      expect(result.data.demoLink).toBeNull();
      expect(result.data.websiteLink).toBeNull();
    });

    it('should map domain entity to response DTO correctly', async () => {
      const dto = {
        name: 'Mapping Test',
        description: 'Testing DTO mapping',
        startDate: '2024-04-01',
        technologies: ['Angular'],
        isHighlighted: false,
      };

      const updatedProject = new Project({
        id: 'proj-789',
        name: 'Mapping Test',
        description: 'Testing DTO mapping',
        startDate: new Date('2024-04-01'),
        endDate: null,
        technologies: ['Angular'],
        repositoryLink: null,
        demoLink: null,
        websiteLink: null,
        achievements: [],
        order: 3,
        isHighlighted: false,
      });

      updateProjectUseCase.execute.mockResolvedValue(updatedProject);

      const result = await controller.updateProject('proj-789', dto);

      // Verify response structure
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({});

      // Verify data properties
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('startDate');
      expect(result.data).toHaveProperty('technologies');
      expect(result.data).toHaveProperty('isHighlighted');
    });
  });
});
