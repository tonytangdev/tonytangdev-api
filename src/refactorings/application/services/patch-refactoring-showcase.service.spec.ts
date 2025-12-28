import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PatchRefactoringShowcaseService } from './patch-refactoring-showcase.service';
import { RefactoringShowcaseRepositoryPort } from '../ports/outbound/refactoring-showcase.repository.port';
import { RefactoringShowcase } from '../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../domain/value-objects/refactoring-file.vo';
import { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo';

describe('PatchRefactoringShowcaseService', () => {
  let service: PatchRefactoringShowcaseService;
  let repository: jest.Mocked<RefactoringShowcaseRepositoryPort>;

  const mockShowcase = new RefactoringShowcase({
    id: 'showcase-1',
    title: 'Original Title',
    description: 'Original Description',
    technologies: ['JavaScript'],
    difficulty: DifficultyLevel.BEGINNER,
    tags: ['tag1'],
    order: 0,
    isHighlighted: false,
    steps: [
      new RefactoringStep({
        id: 'step-1',
        showcaseId: 'showcase-1',
        title: 'Step 1',
        description: 'Step 1 Description',
        explanation: 'Step 1 Explanation',
        order: 0,
        files: [
          new RefactoringFile({
            filename: 'file1.ts',
            language: 'typescript',
            content: 'content1',
            order: 0,
          }),
        ],
      }),
      new RefactoringStep({
        id: 'step-2',
        showcaseId: 'showcase-1',
        title: 'Step 2',
        description: 'Step 2 Description',
        explanation: 'Step 2 Explanation',
        order: 1,
        files: [],
      }),
    ],
  });

  beforeEach(async () => {
    const mockRepositoryPort = {
      findById: jest.fn(),
      patch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchRefactoringShowcaseService,
        {
          provide: RefactoringShowcaseRepositoryPort,
          useValue: mockRepositoryPort,
        },
      ],
    }).compile();

    service = module.get<PatchRefactoringShowcaseService>(
      PatchRefactoringShowcaseService,
    );
    repository = module.get(RefactoringShowcaseRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when showcase does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith('non-existent');
    });

    it('should patch only title', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        title: 'Updated Title',
      });

      expect(repository.patch).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'showcase-1',
          title: 'Updated Title',
          description: 'Original Description',
          technologies: ['JavaScript'],
          difficulty: DifficultyLevel.BEGINNER,
          tags: ['tag1'],
          isHighlighted: false,
          steps: mockShowcase.steps,
        }),
      );
    });

    it('should patch only isHighlighted', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        isHighlighted: true,
      });

      expect(repository.patch).toHaveBeenCalledWith(
        expect.objectContaining({
          isHighlighted: true,
          title: 'Original Title',
        }),
      );
    });

    it('should patch multiple fields', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        title: 'New Title',
        difficulty: DifficultyLevel.ADVANCED,
        tags: ['new-tag'],
      });

      expect(repository.patch).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Title',
          difficulty: DifficultyLevel.ADVANCED,
          tags: ['new-tag'],
          description: 'Original Description',
        }),
      );
    });

    it('should preserve all steps when steps undefined', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        title: 'Updated',
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      expect(patchedShowcase.steps).toHaveLength(2);
      expect(patchedShowcase.steps[0].id).toBe('step-1');
      expect(patchedShowcase.steps[1].id).toBe('step-2');
    });

    it('should clear all steps when steps is empty array', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        steps: [],
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      expect(patchedShowcase.steps).toHaveLength(0);
    });

    it('should update existing step when id provided', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        steps: [
          {
            id: 'step-1',
            title: 'Updated Step 1',
          },
        ],
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      expect(patchedShowcase.steps).toHaveLength(2);
      const updatedStep = patchedShowcase.steps.find((s) => s.id === 'step-1');
      expect(updatedStep?.title).toBe('Updated Step 1');
      expect(updatedStep?.description).toBe('Step 1 Description');
      expect(updatedStep?.files).toHaveLength(1);
    });

    it('should preserve other steps when updating one', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        steps: [
          {
            id: 'step-1',
            title: 'Updated Step 1',
          },
        ],
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      const step2 = patchedShowcase.steps.find((s) => s.id === 'step-2');
      expect(step2).toBeDefined();
      expect(step2?.title).toBe('Step 2');
    });

    it('should create new step when id not provided', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        steps: [
          {
            title: 'New Step',
            description: 'New Description',
            explanation: 'New Explanation',
            files: [],
          },
        ],
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      expect(patchedShowcase.steps).toHaveLength(3);
      const newStep = patchedShowcase.steps.find((s) => s.title === 'New Step');
      expect(newStep).toBeDefined();
      expect(newStep?.id).toBeDefined();
      expect(newStep?.order).toBe(0);
    });

    it('should replace files when files provided for a step', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        steps: [
          {
            id: 'step-1',
            files: [
              {
                filename: 'new.ts',
                language: 'typescript',
                content: 'new content',
              },
            ],
          },
        ],
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      const updatedStep = patchedShowcase.steps.find((s) => s.id === 'step-1');
      expect(updatedStep?.files).toHaveLength(1);
      expect(updatedStep?.files[0].filename).toBe('new.ts');
    });

    it('should preserve files when files undefined for a step', async () => {
      repository.findById.mockResolvedValue(mockShowcase);
      repository.patch.mockResolvedValue(mockShowcase);

      await service.execute({
        id: 'showcase-1',
        steps: [
          {
            id: 'step-1',
            title: 'Updated Step 1',
          },
        ],
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      const updatedStep = patchedShowcase.steps.find((s) => s.id === 'step-1');
      expect(updatedStep?.files).toHaveLength(1);
      expect(updatedStep?.files[0].filename).toBe('file1.ts');
    });

    it('should preserve order from existing showcase', async () => {
      const showcaseWithOrder = new RefactoringShowcase({
        ...mockShowcase,
        order: 5,
      });
      repository.findById.mockResolvedValue(showcaseWithOrder);
      repository.patch.mockResolvedValue(showcaseWithOrder);

      await service.execute({
        id: 'showcase-1',
        title: 'Updated',
      });

      const patchedShowcase = repository.patch.mock.calls[0][0];
      expect(patchedShowcase.order).toBe(5);
    });
  });
});
