import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesController } from './languages.controller';
import { GetLanguagesUseCase } from '../../../../application/ports/inbound/get-languages.use-case';
import { GetHighlightedLanguagesUseCase } from '../../../../application/ports/inbound/get-highlighted-languages.use-case';
import { GetNativeLanguagesUseCase } from '../../../../application/ports/inbound/get-native-languages.use-case';
import { CreateLanguageUseCase } from '../../../../application/ports/inbound/create-language.use-case';
import { LanguageMapper } from '../mappers/language.mapper';
import { Language } from '../../../../domain/entities/language.entity';
import { LanguageProficiency } from '../../../../domain/value-objects/language-proficiency.vo';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('LanguagesController', () => {
  let controller: LanguagesController;
  let getLanguagesUseCase: jest.Mocked<GetLanguagesUseCase>;
  let getHighlightedLanguagesUseCase: jest.Mocked<GetHighlightedLanguagesUseCase>;
  let getNativeLanguagesUseCase: jest.Mocked<GetNativeLanguagesUseCase>;
  let createLanguageUseCase: jest.Mocked<CreateLanguageUseCase>;

  beforeEach(async () => {
    const mockGetLanguagesUseCase = {
      execute: jest.fn(),
    };

    const mockGetHighlightedLanguagesUseCase = {
      execute: jest.fn(),
    };

    const mockGetNativeLanguagesUseCase = {
      execute: jest.fn(),
    };

    const mockCreateLanguageUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        { provide: GetLanguagesUseCase, useValue: mockGetLanguagesUseCase },
        {
          provide: GetHighlightedLanguagesUseCase,
          useValue: mockGetHighlightedLanguagesUseCase,
        },
        {
          provide: GetNativeLanguagesUseCase,
          useValue: mockGetNativeLanguagesUseCase,
        },
        { provide: CreateLanguageUseCase, useValue: mockCreateLanguageUseCase },
        LanguageMapper,
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LanguagesController>(LanguagesController);
    getLanguagesUseCase = module.get(GetLanguagesUseCase);
    getHighlightedLanguagesUseCase = module.get(GetHighlightedLanguagesUseCase);
    getNativeLanguagesUseCase = module.get(GetNativeLanguagesUseCase);
    createLanguageUseCase = module.get(CreateLanguageUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLanguages', () => {
    it('should return all languages', async () => {
      const languages = [
        new Language({
          id: '1',
          name: 'English',
          proficiency: LanguageProficiency.NATIVE,
          isNative: true,
          isHighlighted: true,
          order: 0,
        }),
        new Language({
          id: '2',
          name: 'French',
          proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
          isNative: false,
          isHighlighted: true,
          order: 1,
        }),
      ];

      getLanguagesUseCase.execute.mockResolvedValue(languages);

      const result = await controller.getLanguages();

      expect(getLanguagesUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('id', '1');
      expect(result.data[0]).toHaveProperty('name', 'English');
      expect(result.meta.total).toBe(2);
    });

    it('should return empty array when no languages', async () => {
      getLanguagesUseCase.execute.mockResolvedValue([]);

      const result = await controller.getLanguages();

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getHighlightedLanguages', () => {
    it('should return highlighted languages', async () => {
      const languages = [
        new Language({
          id: '1',
          name: 'English',
          proficiency: LanguageProficiency.NATIVE,
          isNative: true,
          isHighlighted: true,
          order: 0,
        }),
      ];

      getHighlightedLanguagesUseCase.execute.mockResolvedValue(languages);

      const result = await controller.getHighlightedLanguages();

      expect(getHighlightedLanguagesUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isHighlighted).toBe(true);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getNativeLanguages', () => {
    it('should return native languages', async () => {
      const languages = [
        new Language({
          id: '1',
          name: 'English',
          proficiency: LanguageProficiency.NATIVE,
          isNative: true,
          isHighlighted: true,
          order: 0,
        }),
      ];

      getNativeLanguagesUseCase.execute.mockResolvedValue(languages);

      const result = await controller.getNativeLanguages();

      expect(getNativeLanguagesUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isNative).toBe(true);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createLanguage', () => {
    it('should create a language and return response', async () => {
      const dto = {
        name: 'German',
        proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
        isNative: false,
        isHighlighted: true,
      };

      const createdLanguage = new Language({
        id: 'lang-123',
        name: 'German',
        proficiency: LanguageProficiency.PROFESSIONAL_WORKING,
        isNative: false,
        isHighlighted: true,
        order: 5,
      });

      createLanguageUseCase.execute.mockResolvedValue(createdLanguage);

      const result = await controller.createLanguage(dto);

      expect(createLanguageUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('id', 'lang-123');
      expect(result.data).toHaveProperty('name', 'German');
      expect(result.data).toHaveProperty(
        'proficiency',
        LanguageProficiency.PROFESSIONAL_WORKING,
      );
      expect(result.data).toHaveProperty('isNative', false);
      expect(result.data).toHaveProperty('isHighlighted', true);
      expect(result.meta).toEqual({});
    });

    it('should create native language', async () => {
      const dto = {
        name: 'English',
        proficiency: LanguageProficiency.NATIVE,
        isNative: true,
        isHighlighted: true,
      };

      const createdLanguage = new Language({
        id: 'lang-456',
        name: 'English',
        proficiency: LanguageProficiency.NATIVE,
        isNative: true,
        isHighlighted: true,
        order: 1,
      });

      createLanguageUseCase.execute.mockResolvedValue(createdLanguage);

      const result = await controller.createLanguage(dto);

      expect(createLanguageUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data.isNative).toBe(true);
      expect(result.data.proficiency).toBe(LanguageProficiency.NATIVE);
    });

    it('should handle all proficiency levels', async () => {
      const proficiencyLevels = [
        LanguageProficiency.ELEMENTARY,
        LanguageProficiency.LIMITED_WORKING,
        LanguageProficiency.PROFESSIONAL_WORKING,
        LanguageProficiency.FULL_PROFESSIONAL,
        LanguageProficiency.NATIVE,
      ];

      for (const proficiency of proficiencyLevels) {
        const dto = {
          name: `Language-${proficiency}`,
          proficiency,
          isNative: proficiency === LanguageProficiency.NATIVE,
          isHighlighted: false,
        };

        const createdLanguage = new Language({
          id: `lang-${proficiency}`,
          name: `Language-${proficiency}`,
          proficiency,
          isNative: proficiency === LanguageProficiency.NATIVE,
          isHighlighted: false,
          order: 1,
        });

        createLanguageUseCase.execute.mockResolvedValue(createdLanguage);

        const result = await controller.createLanguage(dto);

        expect(result.data.proficiency).toBe(proficiency);
      }
    });
  });
});
