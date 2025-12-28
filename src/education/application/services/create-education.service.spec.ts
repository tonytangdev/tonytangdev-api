import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateEducationService } from './create-education.service';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';
import { DegreeType } from '../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../domain/value-objects/education-status.vo';

describe('CreateEducationService', () => {
  let service: CreateEducationService;
  let educationRepo: jest.Mocked<EducationRepositoryPort>;

  beforeEach(async () => {
    const mockRepo = {
      findByCompositeKey: jest.fn(),
      getMaxOrder: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEducationService,
        {
          provide: EducationRepositoryPort,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CreateEducationService>(CreateEducationService);
    educationRepo = module.get(EducationRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create education with required fields only', async () => {
      const input = {
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-01-15'),
        endDate: new Date('2022-06-30'),
        description: 'Master of Science in Computer Science',
        location: 'Cambridge, MA',
      };

      const expectedEducation = new Education({
        id: expect.any(String),
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

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(4);
      educationRepo.create.mockResolvedValue(expectedEducation);

      const result = await service.execute(input);

      expect(educationRepo.findByCompositeKey).toHaveBeenCalledWith(
        'MIT',
        DegreeType.MASTER,
        'Computer Science',
      );
      expect(educationRepo.getMaxOrder).toHaveBeenCalled();
      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: 'MIT',
          status: EducationStatus.COMPLETED,
          achievements: [],
          isHighlighted: false,
          order: 5,
        }),
      );
      expect(result).toEqual(expectedEducation);
    });

    it('should create education with all optional fields', async () => {
      const input = {
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

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(7);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      const result = await service.execute(input);

      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: 'Stanford University',
          status: EducationStatus.COMPLETED,
          achievements: ['Summa Cum Laude', 'Research Assistant'],
          order: 8,
        }),
      );
      expect(result.achievements).toEqual([
        'Summa Cum Laude',
        'Research Assistant',
      ]);
    });

    it('should throw ConflictException when education with same institution, degree, and field exists', async () => {
      const existingEducation = new Education({
        id: 'existing-123',
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

      const input = {
        institution: 'Harvard University',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Physics',
        startDate: '2021-01-01',
        endDate: '2025-12-31',
        description: 'Another PhD',
        location: 'Cambridge, MA',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(existingEducation);

      await expect(service.execute(input)).rejects.toThrow(ConflictException);
      await expect(service.execute(input)).rejects.toThrow(
        "Education record with institution 'Harvard University', degree type 'doctorate', and field of study 'Physics' already exists",
      );
      expect(educationRepo.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when startDate is in the future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const input = {
        institution: 'Future University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Time Travel',
        startDate: futureDate,
        description: 'Futuristic degree',
        location: 'The Future',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'Start date cannot be in the future',
      );
    });

    it('should throw BadRequestException when startDate >= endDate', async () => {
      const input = {
        institution: 'Invalid Dates University',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Mathematics',
        startDate: new Date('2022-12-31'),
        endDate: new Date('2022-06-01'),
        description: 'Invalid date range',
        location: 'Somewhere',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'Start date must be before end date',
      );
    });

    it('should throw BadRequestException when IN_PROGRESS has endDate', async () => {
      const input = {
        institution: 'Ongoing University',
        degreeType: DegreeType.CERTIFICATE,
        fieldOfStudy: 'Data Science',
        startDate: '2023-01-01',
        endDate: '2024-12-31',
        description: 'Ongoing certificate',
        location: 'Online',
        status: EducationStatus.IN_PROGRESS,
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'IN_PROGRESS education must have null end date',
      );
    });

    it('should throw BadRequestException when COMPLETED has no endDate', async () => {
      const input = {
        institution: 'Incomplete University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Biology',
        startDate: '2018-01-01',
        endDate: null,
        description: 'Completed but no end date',
        location: 'Test Location',
        status: EducationStatus.COMPLETED,
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'completed education must have an end date',
      );
    });

    it('should throw BadRequestException when DROPPED has no endDate', async () => {
      const input = {
        institution: 'Dropped University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Chemistry',
        startDate: '2019-01-01',
        description: 'Dropped program',
        location: 'Test Location',
        status: EducationStatus.DROPPED,
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'dropped education must have an end date',
      );
    });

    it('should auto-increment order based on max order', async () => {
      const input = {
        institution: 'Order Test University',
        degreeType: DegreeType.DIPLOMA,
        fieldOfStudy: 'Testing',
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        description: 'Test order',
        location: 'Test',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(42);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ order: 43 }),
      );
    });

    it('should generate UUID for id', async () => {
      const input = {
        institution: 'UUID Test University',
        degreeType: DegreeType.BOOTCAMP,
        fieldOfStudy: 'Full Stack Development',
        startDate: '2023-01-01',
        endDate: '2023-06-30',
        description: 'Bootcamp',
        location: 'Online',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(10);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      const createCall = educationRepo.create.mock.calls[0][0];
      expect(createCall.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should convert date strings to Date objects', async () => {
      const input = {
        institution: 'Date Conversion University',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Software Engineering',
        startDate: '2020-09-01',
        endDate: '2022-05-31',
        description: 'Master of Software Engineering',
        location: 'Test',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(5);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      const createCall = educationRepo.create.mock.calls[0][0];
      expect(createCall.startDate).toBeInstanceOf(Date);
      expect(createCall.endDate).toBeInstanceOf(Date);
      expect(createCall.startDate.getFullYear()).toBe(2020);
      expect(createCall.endDate?.getFullYear()).toBe(2022);
    });

    it('should create IN_PROGRESS education with null endDate', async () => {
      const input = {
        institution: 'Current University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Computer Science',
        startDate: '2022-01-01',
        description: 'Currently pursuing',
        location: 'Campus',
        status: EducationStatus.IN_PROGRESS,
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(3);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EducationStatus.IN_PROGRESS,
          endDate: null,
        }),
      );
    });

    it('should default status to COMPLETED when not provided', async () => {
      const input = {
        institution: 'Default Status University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'History',
        startDate: '2015-01-01',
        endDate: '2019-06-01',
        description: 'Default status test',
        location: 'Test',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(2);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EducationStatus.COMPLETED,
        }),
      );
    });

    it('should default achievements to empty array when not provided', async () => {
      const input = {
        institution: 'No Achievements University',
        degreeType: DegreeType.BACHELOR,
        fieldOfStudy: 'Art',
        startDate: '2016-01-01',
        endDate: '2020-06-01',
        description: 'No achievements',
        location: 'Test',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(1);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          achievements: [],
        }),
      );
    });

    it('should set isHighlighted to false by default', async () => {
      const input = {
        institution: 'Not Highlighted University',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Economics',
        startDate: '2017-01-01',
        endDate: '2019-12-31',
        description: 'Not highlighted',
        location: 'Test',
      };

      educationRepo.findByCompositeKey.mockResolvedValue(null);
      educationRepo.getMaxOrder.mockResolvedValue(0);
      educationRepo.create.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isHighlighted: false,
        }),
      );
    });
  });
});
