import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateSkillCategoryService } from './create-skill-category.service';
import { SkillCategoryRepositoryPort } from '../ports/outbound/skill-category.repository.port';
import { SkillCategory } from '../../domain/entities/skill-category.entity';

describe('CreateSkillCategoryService', () => {
  let service: CreateSkillCategoryService;
  let categoryRepo: jest.Mocked<SkillCategoryRepositoryPort>;

  beforeEach(async () => {
    const mockCategoryRepo = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      getMaxOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSkillCategoryService,
        { provide: SkillCategoryRepositoryPort, useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<CreateSkillCategoryService>(
      CreateSkillCategoryService,
    );
    categoryRepo = module.get(SkillCategoryRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category successfully', async () => {
    const input = { name: 'Programming Languages' };

    const expectedCategory = new SkillCategory({
      id: expect.any(String),
      name: 'Programming Languages',
      slug: 'programming-languages',
      order: 6,
    });

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(5);
    categoryRepo.create.mockResolvedValue(expectedCategory);

    const result = await service.execute(input);

    expect(categoryRepo.findByName).toHaveBeenCalledWith(
      'Programming Languages',
    );
    expect(categoryRepo.findBySlug).toHaveBeenCalledWith(
      'programming-languages',
    );
    expect(categoryRepo.getMaxOrder).toHaveBeenCalled();
    expect(categoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Programming Languages',
        slug: 'programming-languages',
        order: 6,
      }),
    );
    expect(result).toEqual(expectedCategory);
  });

  it('should auto-generate slug from name', async () => {
    const input = { name: 'Frontend Frameworks' };

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(0);
    categoryRepo.create.mockImplementation((category) =>
      Promise.resolve(category),
    );

    await service.execute(input);

    expect(categoryRepo.findBySlug).toHaveBeenCalledWith('frontend-frameworks');
    expect(categoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'frontend-frameworks',
      }),
    );
  });

  it('should handle special characters in slug generation', async () => {
    const input = { name: 'DevOps & CI/CD Tools!' };

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(0);
    categoryRepo.create.mockImplementation((category) =>
      Promise.resolve(category),
    );

    await service.execute(input);

    expect(categoryRepo.findBySlug).toHaveBeenCalledWith('devops--cicd-tools');
    expect(categoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'devops--cicd-tools',
      }),
    );
  });

  it('should handle multiple spaces in slug generation', async () => {
    const input = { name: '  Cloud   Platforms  ' };

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(0);
    categoryRepo.create.mockImplementation((category) =>
      Promise.resolve(category),
    );

    await service.execute(input);

    expect(categoryRepo.findBySlug).toHaveBeenCalledWith('cloud-platforms');
  });

  it('should throw ConflictException when category name already exists', async () => {
    const existingCategory = new SkillCategory({
      id: 'cat-1',
      name: 'Languages',
      slug: 'languages',
      order: 0,
    });

    const input = { name: 'Languages' };

    categoryRepo.findByName.mockResolvedValue(existingCategory);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      "Category with name 'Languages' already exists",
    );

    expect(categoryRepo.findByName).toHaveBeenCalledWith('Languages');
    expect(categoryRepo.findBySlug).not.toHaveBeenCalled();
    expect(categoryRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when generated slug already exists', async () => {
    const existingCategory = new SkillCategory({
      id: 'cat-1',
      name: 'Programming Languages',
      slug: 'programming-languages',
      order: 0,
    });

    const input = { name: 'Programming  Languages' }; // Different spacing, same slug

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(existingCategory);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      "Category with slug 'programming-languages' already exists",
    );

    expect(categoryRepo.findByName).toHaveBeenCalled();
    expect(categoryRepo.findBySlug).toHaveBeenCalledWith(
      'programming-languages',
    );
    expect(categoryRepo.create).not.toHaveBeenCalled();
  });

  it('should auto-increment order based on max order', async () => {
    const input = { name: 'Testing Tools' };

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(15);
    categoryRepo.create.mockImplementation((category) =>
      Promise.resolve(category),
    );

    await service.execute(input);

    expect(categoryRepo.getMaxOrder).toHaveBeenCalled();
    expect(categoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 16,
      }),
    );
  });

  it('should set order to 1 when no categories exist', async () => {
    const input = { name: 'First Category' };

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(0);
    categoryRepo.create.mockImplementation((category) =>
      Promise.resolve(category),
    );

    await service.execute(input);

    expect(categoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 1,
      }),
    );
  });

  it('should generate valid UUID for id', async () => {
    const input = { name: 'New Category' };

    categoryRepo.findByName.mockResolvedValue(null);
    categoryRepo.findBySlug.mockResolvedValue(null);
    categoryRepo.getMaxOrder.mockResolvedValue(0);
    categoryRepo.create.mockImplementation((category) =>
      Promise.resolve(category),
    );

    await service.execute(input);

    expect(categoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
      }),
    );
  });
});
