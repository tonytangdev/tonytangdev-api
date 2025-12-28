import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProjectService } from './delete-project.service';
import { ProjectRepositoryPort } from '../ports/outbound/project.repository.port';
import { Project } from '../../domain/entities/project.entity';

describe('DeleteProjectService', () => {
  let service: DeleteProjectService;
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
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProjectService,
        { provide: ProjectRepositoryPort, useValue: mockProjectRepo },
      ],
    }).compile();

    service = module.get<DeleteProjectService>(DeleteProjectService);
    projectRepo = module.get(ProjectRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete project successfully', async () => {
    const existingProject = new Project({
      id: 'proj-1',
      name: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform',
      startDate: new Date('2024-01-15'),
      endDate: null,
      technologies: ['TypeScript', 'React', 'Node.js'],
      repositoryLink: null,
      demoLink: null,
      websiteLink: null,
      achievements: [],
      order: 1,
      isHighlighted: false,
    });

    projectRepo.findById.mockResolvedValue(existingProject);
    projectRepo.delete.mockResolvedValue(undefined);

    await service.execute({ id: 'proj-1' });

    expect(projectRepo.findById).toHaveBeenCalledWith('proj-1');
    expect(projectRepo.delete).toHaveBeenCalledWith('proj-1');
  });

  it('should throw NotFoundException when project not found', async () => {
    projectRepo.findById.mockResolvedValue(null);

    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      "Project with id 'non-existent' not found",
    );

    expect(projectRepo.findById).toHaveBeenCalledWith('non-existent');
    expect(projectRepo.delete).not.toHaveBeenCalled();
  });
});
