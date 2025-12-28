import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateLanguageService } from './create-language.service';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';
import { Language } from '../../domain/entities/language.entity';
import { LanguageProficiency } from '../../domain/value-objects/language-proficiency.vo';

describe('CreateLanguageService', () => {
  let service: CreateLanguageService;
  let languageRepo: jest.Mocked<LanguageRepositoryPort>;

  beforeEach(async () => {
    const mockLanguageRepo = {
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findNative: jest.fn(),
      create: jest.fn(),
      findByName: jest.fn(),
      getMaxOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLanguageService,
        { provide: LanguageRepositoryPort, useValue: mockLanguageRepo },
      ],
    }).compile();

    service = module.get<CreateLanguageService>(CreateLanguageService);
    languageRepo = module.get(LanguageRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a language successfully', async () => {
    const input = {
      name: 'German',
      proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
      isNative: false,
      isHighlighted: true,
    };

    const expectedLanguage = new Language({
      id: expect.any(String),
      name: 'German',
      proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
      isNative: false,
      isHighlighted: true,
      order: 11,
    });

    languageRepo.findByName.mockResolvedValue(null);
    languageRepo.getMaxOrder.mockResolvedValue(10);
    languageRepo.create.mockResolvedValue(expectedLanguage);

    const result = await service.execute(input);

    expect(languageRepo.findByName).toHaveBeenCalledWith('German');
    expect(languageRepo.getMaxOrder).toHaveBeenCalled();
    expect(languageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'German',
        proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
        isNative: false,
        isHighlighted: true,
        order: 11,
      }),
    );
    expect(result).toEqual(expectedLanguage);
  });

  it('should create native language', async () => {
    const input = {
      name: 'English',
      proficiency: LanguageProficiency.NATIVE,
      isNative: true,
      isHighlighted: true,
    };

    const expectedLanguage = new Language({
      id: expect.any(String),
      name: 'English',
      proficiency: LanguageProficiency.NATIVE,
      isNative: true,
      isHighlighted: true,
      order: 1,
    });

    languageRepo.findByName.mockResolvedValue(null);
    languageRepo.getMaxOrder.mockResolvedValue(0);
    languageRepo.create.mockResolvedValue(expectedLanguage);

    const result = await service.execute(input);

    expect(result.isNative).toBe(true);
    expect(result.proficiency).toBe(LanguageProficiency.NATIVE);
  });

  it('should throw ConflictException when language name already exists', async () => {
    const existingLanguage = new Language({
      id: 'lang-1',
      name: 'French',
      proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
      isNative: false,
      isHighlighted: true,
      order: 0,
    });

    const input = {
      name: 'French',
      proficiency: LanguageProficiency.ELEMENTARY,
      isNative: false,
      isHighlighted: false,
    };

    languageRepo.findByName.mockResolvedValue(existingLanguage);

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
    await expect(service.execute(input)).rejects.toThrow(
      "Language with name 'French' already exists",
    );

    expect(languageRepo.findByName).toHaveBeenCalledWith('French');
    expect(languageRepo.create).not.toHaveBeenCalled();
  });

  it('should auto-increment order based on max order', async () => {
    const input = {
      name: 'Spanish',
      proficiency: LanguageProficiency.LIMITED_WORKING,
      isNative: false,
      isHighlighted: false,
    };

    languageRepo.findByName.mockResolvedValue(null);
    languageRepo.getMaxOrder.mockResolvedValue(42);
    languageRepo.create.mockImplementation((language) =>
      Promise.resolve(language),
    );

    await service.execute(input);

    expect(languageRepo.getMaxOrder).toHaveBeenCalled();
    expect(languageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 43,
      }),
    );
  });

  it('should set order to 1 when no languages exist', async () => {
    const input = {
      name: 'Japanese',
      proficiency: LanguageProficiency.ELEMENTARY,
      isNative: false,
      isHighlighted: false,
    };

    languageRepo.findByName.mockResolvedValue(null);
    languageRepo.getMaxOrder.mockResolvedValue(0);
    languageRepo.create.mockImplementation((language) =>
      Promise.resolve(language),
    );

    await service.execute(input);

    expect(languageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 1,
      }),
    );
  });
});
