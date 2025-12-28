import { NotFoundException } from '@nestjs/common';
import { UpdateRefactoringShowcaseService } from './update-refactoring-showcase.service';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';
import { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';

describe('UpdateRefactoringShowcaseService', () => {
  let service: UpdateRefactoringShowcaseService;
  let mockRepository: jest.Mocked<RefactoringShowcaseRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findHighlighted: jest.fn(),
      getMaxOrder: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    service = new UpdateRefactoringShowcaseService(mockRepository);
  });

  describe('execute', () => {
    it('should update showcase with all fields', async () => {
      const existingShowcase = new RefactoringShowcase({
        id: 'existing-id',
        title: 'Old Title',
        description: 'Old description',
        technologies: ['JavaScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: ['old-tag'],
        order: 5,
        isHighlighted: false,
        steps: [],
      });

      const input = {
        id: 'existing-id',
        title: 'Updated Title',
        description: 'Updated description',
        technologies: ['TypeScript', 'JavaScript'],
        difficulty: DifficultyLevel.ADVANCED,
        tags: ['clean-code', 'refactoring'],
        isHighlighted: true,
        steps: [
          {
            title: 'Step 1',
            description: 'First step',
            explanation: 'Explanation',
            files: [
              {
                filename: 'before.ts',
                language: 'typescript',
                content: 'code here',
              },
            ],
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(existingShowcase);
      mockRepository.update.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(mockRepository.findById).toHaveBeenCalledWith('existing-id');
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 'existing-id',
        title: 'Updated Title',
        description: 'Updated description',
        technologies: ['TypeScript', 'JavaScript'],
        difficulty: DifficultyLevel.ADVANCED,
        tags: ['clean-code', 'refactoring'],
        isHighlighted: true,
        order: 5,
      });
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].files).toHaveLength(1);
    });

    it('should preserve order from existing showcase', async () => {
      const existingShowcase = new RefactoringShowcase({
        id: 'test-id',
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        order: 10,
        isHighlighted: false,
        steps: [],
      });

      const input = {
        id: 'test-id',
        title: 'Updated',
        description: 'Updated',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        tags: ['test'],
        steps: [],
      };

      mockRepository.findById.mockResolvedValue(existingShowcase);
      mockRepository.update.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.order).toBe(10);
    });

    it('should throw NotFoundException when showcase not found', async () => {
      const input = {
        id: 'non-existent-id',
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(NotFoundException);
      await expect(service.execute(input)).rejects.toThrow(
        'Refactoring showcase with ID non-existent-id not found',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should set isHighlighted to false when not provided', async () => {
      const existingShowcase = new RefactoringShowcase({
        id: 'test-id',
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        order: 1,
        isHighlighted: true,
        steps: [],
      });

      const input = {
        id: 'test-id',
        title: 'Updated',
        description: 'Updated',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      mockRepository.findById.mockResolvedValue(existingShowcase);
      mockRepository.update.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.isHighlighted).toBe(false);
    });
  });
});
