import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteLanguageService } from './delete-language.service';
import { LanguageRepositoryPort } from '../ports/outbound/language.repository.port';
import { Language } from '../../domain/entities/language.entity';
import { LanguageProficiency } from '../../domain/value-objects/language-proficiency.vo';

describe('DeleteLanguageService', () => {
  let service: DeleteLanguageService;
  let languageRepo: jest.Mocked<LanguageRepositoryPort>;

  beforeEach(async () => {
    const mockLanguageRepo = {
      findAll: jest.fn(),
      findHighlighted: jest.fn(),
      findNative: jest.fn(),
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      getMaxOrder: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteLanguageService,
        { provide: LanguageRepositoryPort, useValue: mockLanguageRepo },
      ],
    }).compile();

    service = module.get<DeleteLanguageService>(DeleteLanguageService);
    languageRepo = module.get(LanguageRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete language successfully', async () => {
    const existingLanguage = new Language({
      id: 'lang-1',
      name: 'French',
      proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
      isNative: false,
      isHighlighted: true,
      order: 1,
    });

    languageRepo.findById.mockResolvedValue(existingLanguage);
    languageRepo.delete.mockResolvedValue(undefined);

    await service.execute({ id: 'lang-1' });

    expect(languageRepo.findById).toHaveBeenCalledWith('lang-1');
    expect(languageRepo.delete).toHaveBeenCalledWith('lang-1');
  });

  it('should throw NotFoundException when language not found', async () => {
    languageRepo.findById.mockResolvedValue(null);

    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      "Language with id 'non-existent' not found",
    );

    expect(languageRepo.findById).toHaveBeenCalledWith('non-existent');
    expect(languageRepo.delete).not.toHaveBeenCalled();
  });
});
