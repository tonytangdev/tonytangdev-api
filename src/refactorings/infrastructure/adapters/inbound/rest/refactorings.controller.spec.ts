import { Test, TestingModule } from '@nestjs/testing';
import { RefactoringsController } from './refactorings.controller';
import { GetRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-refactoring-showcases.use-case';
import { GetRefactoringShowcaseByIdUseCase } from '../../../../application/ports/inbound/get-refactoring-showcase-by-id.use-case';
import { GetHighlightedRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { CreateRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/create-refactoring-showcase.use-case';
import { UpdateRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/update-refactoring-showcase.use-case';
import { PatchRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/patch-refactoring-showcase.use-case';
import { RefactoringShowcaseMapper } from '../mappers/refactoring-showcase.mapper';
import { RefactoringShowcase } from '../../../../domain/entities/refactoring-showcase.entity';
import { DifficultyLevel } from '../../../../domain/value-objects/difficulty-level.vo';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('RefactoringsController', () => {
  let controller: RefactoringsController;
  let createRefactoringShowcaseUseCase: jest.Mocked<CreateRefactoringShowcaseUseCase>;
  let updateRefactoringShowcaseUseCase: jest.Mocked<UpdateRefactoringShowcaseUseCase>;
  let patchRefactoringShowcaseUseCase: jest.Mocked<PatchRefactoringShowcaseUseCase>;

  beforeEach(async () => {
    const mockGetRefactoringShowcasesUseCase = {
      execute: jest.fn(),
    };

    const mockGetRefactoringShowcaseByIdUseCase = {
      execute: jest.fn(),
    };

    const mockGetHighlightedRefactoringShowcasesUseCase = {
      execute: jest.fn(),
    };

    const mockCreateRefactoringShowcaseUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateRefactoringShowcaseUseCase = {
      execute: jest.fn(),
    };

    const mockPatchRefactoringShowcaseUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefactoringsController],
      providers: [
        {
          provide: GetRefactoringShowcasesUseCase,
          useValue: mockGetRefactoringShowcasesUseCase,
        },
        {
          provide: GetRefactoringShowcaseByIdUseCase,
          useValue: mockGetRefactoringShowcaseByIdUseCase,
        },
        {
          provide: GetHighlightedRefactoringShowcasesUseCase,
          useValue: mockGetHighlightedRefactoringShowcasesUseCase,
        },
        {
          provide: CreateRefactoringShowcaseUseCase,
          useValue: mockCreateRefactoringShowcaseUseCase,
        },
        {
          provide: UpdateRefactoringShowcaseUseCase,
          useValue: mockUpdateRefactoringShowcaseUseCase,
        },
        {
          provide: PatchRefactoringShowcaseUseCase,
          useValue: mockPatchRefactoringShowcaseUseCase,
        },
        RefactoringShowcaseMapper,
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RefactoringsController>(RefactoringsController);
    createRefactoringShowcaseUseCase = module.get(
      CreateRefactoringShowcaseUseCase,
    );
    updateRefactoringShowcaseUseCase = module.get(
      UpdateRefactoringShowcaseUseCase,
    );
    patchRefactoringShowcaseUseCase = module.get(
      PatchRefactoringShowcaseUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRefactoringShowcase', () => {
    it('should create showcase and return mapped response', async () => {
      const dto = {
        title: 'Extract Method',
        description: 'Learn to extract methods',
        technologies: ['TypeScript'],
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
                content: 'code',
              },
            ],
          },
        ],
      };

      const showcase = new RefactoringShowcase({
        id: '123',
        title: 'Extract Method',
        description: 'Learn to extract methods',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: ['clean-code'],
        order: 1,
        isHighlighted: false,
        steps: [],
      });

      createRefactoringShowcaseUseCase.execute.mockResolvedValue(showcase);

      const result = await controller.createRefactoringShowcase(dto);

      expect(createRefactoringShowcaseUseCase.execute).toHaveBeenCalledWith(
        dto,
      );
      expect(result.data.title).toBe('Extract Method');
      expect(result.meta).toEqual({});
    });

    it('should return proper response structure', async () => {
      const dto = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      const showcase = new RefactoringShowcase({
        id: '123',
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        order: 1,
        isHighlighted: false,
        steps: [],
      });

      createRefactoringShowcaseUseCase.execute.mockResolvedValue(showcase);

      const result = await controller.createRefactoringShowcase(dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({});
    });
  });

  describe('updateRefactoringShowcase', () => {
    it('should update showcase and return mapped response', async () => {
      const id = 'showcase-123';
      const dto = {
        title: 'Updated Extract Method',
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
                content: 'updated code',
              },
            ],
          },
        ],
      };

      const showcase = new RefactoringShowcase({
        id,
        title: 'Updated Extract Method',
        description: 'Updated description',
        technologies: ['TypeScript', 'JavaScript'],
        difficulty: DifficultyLevel.ADVANCED,
        tags: ['clean-code', 'refactoring'],
        order: 5,
        isHighlighted: true,
        steps: [],
      });

      updateRefactoringShowcaseUseCase.execute.mockResolvedValue(showcase);

      const result = await controller.updateRefactoringShowcase(id, dto);

      expect(updateRefactoringShowcaseUseCase.execute).toHaveBeenCalledWith({
        id,
        ...dto,
      });
      expect(result.data.title).toBe('Updated Extract Method');
      expect(result.data.id).toBe(id);
      expect(result.meta).toEqual({});
    });

    it('should return proper response structure', async () => {
      const id = 'test-id';
      const dto = {
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        steps: [],
      };

      const showcase = new RefactoringShowcase({
        id,
        title: 'Test',
        description: 'Test',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        order: 1,
        isHighlighted: false,
        steps: [],
      });

      updateRefactoringShowcaseUseCase.execute.mockResolvedValue(showcase);

      const result = await controller.updateRefactoringShowcase(id, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({});
    });
  });

  describe('patchRefactoringShowcase', () => {
    it('should patch showcase and return mapped response', async () => {
      const id = 'showcase-123';
      const dto = {
        title: 'Patched Title',
        isHighlighted: true,
      };

      const showcase = new RefactoringShowcase({
        id,
        title: 'Patched Title',
        description: 'Original description',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: ['clean-code'],
        order: 3,
        isHighlighted: true,
        steps: [],
      });

      patchRefactoringShowcaseUseCase.execute.mockResolvedValue(showcase);

      const result = await controller.patchRefactoringShowcase(id, dto);

      expect(patchRefactoringShowcaseUseCase.execute).toHaveBeenCalledWith({
        id,
        ...dto,
      });
      expect(result.data.title).toBe('Patched Title');
      expect(result.data.isHighlighted).toBe(true);
      expect(result.data.id).toBe(id);
      expect(result.meta).toEqual({});
    });

    it('should return proper response structure', async () => {
      const id = 'test-id';
      const dto = {
        description: 'Patched description',
      };

      const showcase = new RefactoringShowcase({
        id,
        title: 'Original Title',
        description: 'Patched description',
        technologies: ['TypeScript'],
        difficulty: DifficultyLevel.BEGINNER,
        tags: [],
        order: 1,
        isHighlighted: false,
        steps: [],
      });

      patchRefactoringShowcaseUseCase.execute.mockResolvedValue(showcase);

      const result = await controller.patchRefactoringShowcase(id, dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({});
    });
  });
});
