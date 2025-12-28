import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteRefactoringShowcaseService } from './delete-refactoring-showcase.service';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';
import { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo';

describe('DeleteRefactoringShowcaseService', () => {
  let service: DeleteRefactoringShowcaseService;
  let repository: jest.Mocked<RefactoringShowcaseRepositoryPort>;

  const mockShowcase = new RefactoringShowcase({
    id: 'test-id',
    title: 'Test Showcase',
    description: 'Test description',
    technologies: ['TypeScript'],
    difficulty: DifficultyLevel.BEGINNER,
    tags: ['test'],
    order: 0,
    isHighlighted: false,
    steps: [],
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRefactoringShowcaseService,
        {
          provide: RefactoringShowcaseRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DeleteRefactoringShowcaseService>(
      DeleteRefactoringShowcaseService,
    );
    repository = module.get(RefactoringShowcaseRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should delete showcase successfully', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.delete.mockResolvedValue(undefined);

      await service.execute({ id: 'test-id' });

      expect(repository.findById).toHaveBeenCalledWith('test-id');
      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when showcase not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
        "Refactoring showcase with id 'non-existent' not found",
      );
    });

    it('should not call delete when showcase not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.execute({ id: 'non-existent' })).rejects.toThrow();
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
