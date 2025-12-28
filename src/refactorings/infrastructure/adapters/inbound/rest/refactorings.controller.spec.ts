import { Test, TestingModule } from '@nestjs/testing';
import { RefactoringsController } from './refactorings.controller';
import { GetRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-refactoring-showcases.use-case';
import { GetRefactoringShowcaseByIdUseCase } from '../../../../application/ports/inbound/get-refactoring-showcase-by-id.use-case';
import { GetHighlightedRefactoringShowcasesUseCase } from '../../../../application/ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { CreateRefactoringShowcaseUseCase } from '../../../../application/ports/inbound/create-refactoring-showcase.use-case';
import { RefactoringShowcaseMapper } from '../mappers/refactoring-showcase.mapper';
import { RefactoringShowcase } from '../../../../domain/entities/refactoring-showcase.entity';
import { DifficultyLevel } from '../../../../domain/value-objects/difficulty-level.vo';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('RefactoringsController', () => {
  let controller: RefactoringsController;
  let createRefactoringShowcaseUseCase: jest.Mocked<CreateRefactoringShowcaseUseCase>;

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
});
