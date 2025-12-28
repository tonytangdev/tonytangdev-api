import { Test, TestingModule } from '@nestjs/testing';
import { EducationController } from './education.controller';
import { GetEducationUseCase } from '../../../../application/ports/inbound/get-education.use-case';
import { GetHighlightedEducationUseCase } from '../../../../application/ports/inbound/get-highlighted-education.use-case';
import { GetInProgressEducationUseCase } from '../../../../application/ports/inbound/get-in-progress-education.use-case';
import { CreateEducationUseCase } from '../../../../application/ports/inbound/create-education.use-case';
import { UpdateEducationUseCase } from '../../../../application/ports/inbound/update-education.use-case';
import { DeleteEducationUseCase } from '../../../../application/ports/inbound/delete-education.use-case';
import { EducationMapper } from '../mappers/education.mapper';
import { Education } from '../../../../domain/entities/education.entity';
import { DegreeType } from '../../../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../../../domain/value-objects/education-status.vo';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

describe('EducationController', () => {
  let controller: EducationController;
  let getEducationUseCase: jest.Mocked<GetEducationUseCase>;
  let getHighlightedEducationUseCase: jest.Mocked<GetHighlightedEducationUseCase>;
  let getInProgressEducationUseCase: jest.Mocked<GetInProgressEducationUseCase>;
  let createEducationUseCase: jest.Mocked<CreateEducationUseCase>;
  let updateEducationUseCase: jest.Mocked<UpdateEducationUseCase>;
  let deleteEducationUseCase: jest.Mocked<DeleteEducationUseCase>;

  beforeEach(async () => {
    const mockGetEducationUseCase = {
      execute: jest.fn(),
    };
    const mockGetHighlightedEducationUseCase = {
      execute: jest.fn(),
    };
    const mockGetInProgressEducationUseCase = {
      execute: jest.fn(),
    };
    const mockCreateEducationUseCase = {
      execute: jest.fn(),
    };
    const mockUpdateEducationUseCase = {
      execute: jest.fn(),
    };
    const mockDeleteEducationUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationController],
      providers: [
        { provide: GetEducationUseCase, useValue: mockGetEducationUseCase },
        {
          provide: GetHighlightedEducationUseCase,
          useValue: mockGetHighlightedEducationUseCase,
        },
        {
          provide: GetInProgressEducationUseCase,
          useValue: mockGetInProgressEducationUseCase,
        },
        {
          provide: CreateEducationUseCase,
          useValue: mockCreateEducationUseCase,
        },
        {
          provide: UpdateEducationUseCase,
          useValue: mockUpdateEducationUseCase,
        },
        {
          provide: DeleteEducationUseCase,
          useValue: mockDeleteEducationUseCase,
        },
        EducationMapper,
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EducationController>(EducationController);
    getEducationUseCase = module.get(GetEducationUseCase);
    getHighlightedEducationUseCase = module.get(GetHighlightedEducationUseCase);
    getInProgressEducationUseCase = module.get(GetInProgressEducationUseCase);
    createEducationUseCase = module.get(CreateEducationUseCase);
    updateEducationUseCase = module.get(UpdateEducationUseCase);
    deleteEducationUseCase = module.get(DeleteEducationUseCase);
  });

  describe('getEducation', () => {
    it('should return all education records', async () => {
      const educations = [
        new Education({
          id: 'edu-1',
          institution: 'Stanford University',
          degreeType: DegreeType.MASTER,
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2020-09-01'),
          endDate: new Date('2022-06-15'),
          description: 'Master of Science in Computer Science',
          location: 'Stanford, CA',
          status: EducationStatus.COMPLETED,
          achievements: [],
          isHighlighted: true,
          order: 0,
        }),
        new Education({
          id: 'edu-2',
          institution: 'MIT',
          degreeType: DegreeType.BACHELOR,
          fieldOfStudy: 'Mathematics',
          startDate: new Date('2016-09-01'),
          endDate: new Date('2020-06-15'),
          description: 'Bachelor of Science in Mathematics',
          location: 'Cambridge, MA',
          status: EducationStatus.COMPLETED,
          achievements: [],
          isHighlighted: false,
          order: 1,
        }),
      ];

      getEducationUseCase.execute.mockResolvedValue(educations);

      const result = await controller.getEducation();

      expect(getEducationUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty(
        'institution',
        'Stanford University',
      );
      expect(result.meta).toEqual({ total: 2 });
    });
  });

  describe('getHighlightedEducation', () => {
    it('should return only highlighted education records', async () => {
      const educations = [
        new Education({
          id: 'edu-1',
          institution: 'Stanford University',
          degreeType: DegreeType.MASTER,
          fieldOfStudy: 'Computer Science',
          startDate: new Date('2020-09-01'),
          endDate: new Date('2022-06-15'),
          description: 'Master of Science in Computer Science',
          location: 'Stanford, CA',
          status: EducationStatus.COMPLETED,
          achievements: [],
          isHighlighted: true,
          order: 0,
        }),
      ];

      getHighlightedEducationUseCase.execute.mockResolvedValue(educations);

      const result = await controller.getHighlightedEducation();

      expect(getHighlightedEducationUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isHighlighted).toBe(true);
      expect(result.meta).toEqual({ total: 1 });
    });
  });

  describe('getInProgressEducation', () => {
    it('should return only in-progress education records', async () => {
      const educations = [
        new Education({
          id: 'edu-3',
          institution: 'Harvard University',
          degreeType: DegreeType.DOCTORATE,
          fieldOfStudy: 'Physics',
          startDate: new Date('2021-09-01'),
          endDate: null,
          description: 'PhD in Physics',
          location: 'Cambridge, MA',
          status: EducationStatus.IN_PROGRESS,
          achievements: [],
          isHighlighted: false,
          order: 2,
        }),
      ];

      getInProgressEducationUseCase.execute.mockResolvedValue(educations);

      const result = await controller.getInProgressEducation();

      expect(getInProgressEducationUseCase.execute).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('in_progress');
      expect(result.data[0].endDate).toBeNull();
      expect(result.meta).toEqual({ total: 1 });
    });
  });

  describe('createEducation', () => {
    it('should create an education record and return response', async () => {
      const dto = {
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Master of Science in Computer Science',
        location: 'Cambridge, MA',
      };

      const createdEducation = new Education({
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-01-15'),
        endDate: new Date('2022-06-30'),
        description: 'Master of Science in Computer Science',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        achievements: [],
        isHighlighted: false,
        order: 5,
      });

      createEducationUseCase.execute.mockResolvedValue(createdEducation);

      const result = await controller.createEducation(dto);

      expect(createEducationUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('id', 'edu-123');
      expect(result.data).toHaveProperty('institution', 'MIT');
      expect(result.data).toHaveProperty('degreeType', 'master');
      expect(result.data).toHaveProperty('fieldOfStudy', 'Computer Science');
      expect(result.meta).toEqual({});
    });

    it('should create education with all optional fields', async () => {
      const dto = {
        institution: 'Stanford University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Electrical Engineering',
        startDate: '2018-09-01',
        endDate: '2022-06-15',
        description: 'Bachelor of Science in Electrical Engineering',
        location: 'Stanford, CA',
        status: EducationStatus.COMPLETED,
        achievements: ['Summa Cum Laude', 'Research Assistant'],
      };

      const createdEducation = new Education({
        id: 'edu-456',
        institution: 'Stanford University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Electrical Engineering',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-06-15'),
        description: 'Bachelor of Science in Electrical Engineering',
        location: 'Stanford, CA',
        status: EducationStatus.COMPLETED,
        achievements: ['Summa Cum Laude', 'Research Assistant'],
        isHighlighted: false,
        order: 7,
      });

      createEducationUseCase.execute.mockResolvedValue(createdEducation);

      const result = await controller.createEducation(dto);

      expect(createEducationUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.data).toHaveProperty('achievements');
      expect(result.data.achievements).toEqual([
        'Summa Cum Laude',
        'Research Assistant',
      ]);
    });

    it('should map entity to DTO correctly', async () => {
      const dto = {
        institution: 'Harvard University',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Physics',
        startDate: '2015-01-01',
        endDate: '2020-12-31',
        description: 'PhD in Physics',
        location: 'Cambridge, MA',
      };

      const createdEducation = new Education({
        id: 'edu-789',
        institution: 'Harvard University',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Physics',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2020-12-31'),
        description: 'PhD in Physics',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        achievements: [],
        isHighlighted: false,
        order: 3,
      });

      createEducationUseCase.execute.mockResolvedValue(createdEducation);

      const result = await controller.createEducation(dto);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('institution');
      expect(result.data).toHaveProperty('degreeType');
      expect(result.data).toHaveProperty('fieldOfStudy');
      expect(result.data).toHaveProperty('startDate');
      expect(result.data).toHaveProperty('endDate');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('location');
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('achievements');
      expect(result.data).toHaveProperty('isHighlighted');
    });

    it('should return proper response structure', async () => {
      const dto = {
        institution: 'UC Berkeley',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Mathematics',
        startDate: '2017-09-01',
        endDate: '2021-06-15',
        description: 'Bachelor of Science in Mathematics',
        location: 'Berkeley, CA',
      };

      const createdEducation = new Education({
        id: 'edu-101',
        institution: 'UC Berkeley',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Mathematics',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-06-15'),
        description: 'Bachelor of Science in Mathematics',
        location: 'Berkeley, CA',
        status: EducationStatus.COMPLETED,
        achievements: [],
        isHighlighted: false,
        order: 2,
      });

      createEducationUseCase.execute.mockResolvedValue(createdEducation);

      const result = await controller.createEducation(dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({});
      expect(typeof result.data).toBe('object');
    });
  });

  describe('updateEducation', () => {
    it('should update an education record and return response', async () => {
      const dto = {
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Updated description',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: true,
      };

      const updatedEducation = new Education({
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-01-15'),
        endDate: new Date('2022-06-30'),
        description: 'Updated description',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        achievements: [],
        isHighlighted: true,
        order: 5,
      });

      updateEducationUseCase.execute.mockResolvedValue(updatedEducation);

      const result = await controller.updateEducation('edu-123', dto);

      expect(updateEducationUseCase.execute).toHaveBeenCalledWith({
        id: 'edu-123',
        ...dto,
      });
      expect(result.data).toHaveProperty('id', 'edu-123');
      expect(result.data).toHaveProperty('institution', 'MIT');
      expect(result.data).toHaveProperty('description', 'Updated description');
      expect(result.data).toHaveProperty('isHighlighted', true);
      expect(result.meta).toEqual({});
    });

    it('should update education with minimal fields', async () => {
      const dto = {
        institution: 'Stanford',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Physics',
        startDate: '2018-09-01',
        description: 'Minimal update',
        location: 'Stanford, CA',
        status: EducationStatus.IN_PROGRESS,
        isHighlighted: false,
      };

      const updatedEducation = new Education({
        id: 'edu-456',
        institution: 'Stanford',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Physics',
        startDate: new Date('2018-09-01'),
        endDate: null,
        description: 'Minimal update',
        location: 'Stanford, CA',
        status: EducationStatus.IN_PROGRESS,
        achievements: [],
        isHighlighted: false,
        order: 3,
      });

      updateEducationUseCase.execute.mockResolvedValue(updatedEducation);

      const result = await controller.updateEducation('edu-456', dto);

      expect(updateEducationUseCase.execute).toHaveBeenCalledWith({
        id: 'edu-456',
        ...dto,
      });
      expect(result.data).toHaveProperty('status', 'in_progress');
      expect(result.data).toHaveProperty('endDate', null);
    });

    it('should map updated entity to DTO correctly', async () => {
      const dto = {
        institution: 'Harvard',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Mathematics',
        startDate: '2015-01-01',
        endDate: '2020-12-31',
        description: 'Updated PhD',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        achievements: ['Best Dissertation'],
        isHighlighted: true,
      };

      const updatedEducation = new Education({
        id: 'edu-789',
        institution: 'Harvard',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Mathematics',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2020-12-31'),
        description: 'Updated PhD',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        achievements: ['Best Dissertation'],
        isHighlighted: true,
        order: 2,
      });

      updateEducationUseCase.execute.mockResolvedValue(updatedEducation);

      const result = await controller.updateEducation('edu-789', dto);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('institution');
      expect(result.data).toHaveProperty('degreeType');
      expect(result.data).toHaveProperty('fieldOfStudy');
      expect(result.data).toHaveProperty('startDate');
      expect(result.data).toHaveProperty('endDate');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('location');
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('achievements');
      expect(result.data).toHaveProperty('isHighlighted');
      expect(result.data).toHaveProperty('order');
    });
  });

  describe('deleteEducation', () => {
    it('should delete education successfully', async () => {
      deleteEducationUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteEducation('edu-123');

      expect(deleteEducationUseCase.execute).toHaveBeenCalledWith({
        id: 'edu-123',
      });
      expect(result).toEqual({ data: null, meta: {} });
    });

    it('should throw NotFoundException when education not found', async () => {
      const notFoundError = new Error('Education not found');
      deleteEducationUseCase.execute.mockRejectedValue(notFoundError);

      await expect(
        controller.deleteEducation('non-existent'),
      ).rejects.toThrow();
      expect(deleteEducationUseCase.execute).toHaveBeenCalledWith({
        id: 'non-existent',
      });
    });
  });
});
