import { CreateRefactoringShowcaseService } from './create-refactoring-showcase.service';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';
import { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo';

describe('CreateRefactoringShowcaseService', () => {
  let service: CreateRefactoringShowcaseService;
  let mockRepository: jest.Mocked<RefactoringShowcaseRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findHighlighted: jest.fn(),
      getMaxOrder: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    service = new CreateRefactoringShowcaseService(mockRepository);
  });

  describe('execute', () => {
    it('should create showcase with required fields', async () => {
      const input = {
        title: 'Extract Method',
        description: 'Learn to extract methods',
        technologies: ['TypeScript', 'JavaScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: ['clean-code'],
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

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(mockRepository.getMaxOrder).toHaveBeenCalled();
      expect(result).toMatchObject({
        title: 'Extract Method',
        description: 'Learn to extract methods',
        technologies: ['TypeScript', 'JavaScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: ['clean-code'],
        isHighlighted: false,
        order: 1,
      });
      expect(result.id).toBeDefined();
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].files).toHaveLength(1);
    });

    it('should create showcase with all fields including isHighlighted', async () => {
      const input = {
        title: 'Extract Method',
        description: 'Learn to extract methods',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.ADVANCED,
        tags: ['refactoring'],
        isHighlighted: true,
        steps: [],
      };

      mockRepository.getMaxOrder.mockResolvedValue(5);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.isHighlighted).toBe(true);
      expect(result.order).toBe(6);
    });

    it('should generate UUID for showcase', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should auto-increment showcase order', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      mockRepository.getMaxOrder.mockResolvedValue(10);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.order).toBe(11);
    });

    it('should auto-assign step order based on array index', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [
          {
            title: 'Step 1',
            description: 'First',
            explanation: 'Explain 1',
            files: [],
          },
          {
            title: 'Step 2',
            description: 'Second',
            explanation: 'Explain 2',
            files: [],
          },
          {
            title: 'Step 3',
            description: 'Third',
            explanation: 'Explain 3',
            files: [],
          },
        ],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.steps[0].order).toBe(0);
      expect(result.steps[1].order).toBe(1);
      expect(result.steps[2].order).toBe(2);
    });

    it('should auto-assign file order based on array index', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [
          {
            title: 'Step 1',
            description: 'First',
            explanation: 'Explain',
            files: [
              { filename: 'file1.ts', language: 'typescript', content: 'a' },
              { filename: 'file2.ts', language: 'typescript', content: 'b' },
              { filename: 'file3.ts', language: 'typescript', content: 'c' },
            ],
          },
        ],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.steps[0].files[0].order).toBe(0);
      expect(result.steps[0].files[1].order).toBe(1);
      expect(result.steps[0].files[2].order).toBe(2);
    });

    it('should default isHighlighted to false when not provided', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.isHighlighted).toBe(false);
    });

    it('should handle empty steps array', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.steps).toEqual([]);
    });

    it('should handle steps with empty files array', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [
          {
            title: 'Step 1',
            description: 'First',
            explanation: 'Explain',
            files: [],
          },
        ],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.steps[0].files).toEqual([]);
    });

    it('should generate unique UUIDs for steps', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [
          {
            title: 'Step 1',
            description: 'First',
            explanation: 'Explain',
            files: [],
          },
          {
            title: 'Step 2',
            description: 'Second',
            explanation: 'Explain',
            files: [],
          },
        ],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.steps[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(result.steps[1].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(result.steps[0].id).not.toBe(result.steps[1].id);
    });

    it('should set showcaseId in all steps', async () => {
      const input = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [
          {
            title: 'Step 1',
            description: 'First',
            explanation: 'Explain',
            files: [],
          },
          {
            title: 'Step 2',
            description: 'Second',
            explanation: 'Explain',
            files: [],
          },
        ],
      };

      mockRepository.getMaxOrder.mockResolvedValue(0);
      mockRepository.create.mockImplementation((showcase) =>
        Promise.resolve(showcase),
      );

      const result = await service.execute(input);

      expect(result.steps[0].showcaseId).toBe(result.id);
      expect(result.steps[1].showcaseId).toBe(result.id);
    });
  });
});
