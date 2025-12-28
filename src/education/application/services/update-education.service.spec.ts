import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateEducationService } from './update-education.service';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';
import { DegreeType } from '../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../domain/value-objects/education-status.vo';

describe('UpdateEducationService', () => {
  let service: UpdateEducationService;
  let educationRepo: jest.Mocked<EducationRepositoryPort>;

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      findByCompositeKeyExcludingId: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEducationService,
        {
          provide: EducationRepositoryPort,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UpdateEducationService>(UpdateEducationService);
    educationRepo = module.get(EducationRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingEducation = new Education({
      id: 'edu-123',
      institution: 'MIT',
      degreeType: DegreeType.MASTER,
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2020-01-15'),
      endDate: new Date('2022-06-30'),
      description: 'Old description',
      location: 'Cambridge, MA',
      status: EducationStatus.COMPLETED,
      achievements: ['Old achievement'],
      isHighlighted: false,
      order: 5,
    });

    it('should update education with all fields', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2020-01-15'),
        endDate: new Date('2022-06-30'),
        description: 'Updated description',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        achievements: ['New achievement', 'Another achievement'],
        isHighlighted: true,
      };

      const updatedEducation = new Education({
        ...input,
        order: 5,
      });

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockResolvedValue(updatedEducation);

      const result = await service.execute(input);

      expect(educationRepo.findById).toHaveBeenCalledWith('edu-123');
      expect(educationRepo.findByCompositeKeyExcludingId).toHaveBeenCalledWith({
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        excludeId: 'edu-123',
      });
      expect(educationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'edu-123',
          description: 'Updated description',
          achievements: ['New achievement', 'Another achievement'],
          isHighlighted: true,
          order: 5, // Preserved from existing
        }),
      );
      expect(result).toEqual(updatedEducation);
    });

    it('should update education with minimal fields', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        description: 'Minimal update',
        location: 'Cambridge, MA',
        status: EducationStatus.IN_PROGRESS,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      const result = await service.execute(input);

      expect(educationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EducationStatus.IN_PROGRESS,
          endDate: null,
          achievements: [],
        }),
      );
      expect(result.order).toBe(5); // Preserved
    });

    it('should preserve order field from existing education', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Updated',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ order: 5 }),
      );
    });

    it('should throw NotFoundException when education not found', async () => {
      const input = {
        id: 'nonexistent-id',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Update',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(NotFoundException);
      await expect(service.execute(input)).rejects.toThrow(
        "Education with id 'nonexistent-id' not found",
      );
      expect(educationRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate composite key', async () => {
      const duplicateEducation = new Education({
        id: 'different-id',
        institution: 'Stanford',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Physics',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2020-12-31'),
        description: 'PhD',
        location: 'Stanford, CA',
        status: EducationStatus.COMPLETED,
        achievements: [],
        isHighlighted: false,
        order: 3,
      });

      const input = {
        id: 'edu-123',
        institution: 'Stanford',
        degreeType: DegreeType.DOCTORATE,
        fieldOfStudy: 'Physics',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Updated',
        location: 'Stanford, CA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(
        duplicateEducation,
      );

      await expect(service.execute(input)).rejects.toThrow(ConflictException);
      await expect(service.execute(input)).rejects.toThrow(
        "Education record with institution 'Stanford', degree type 'doctorate', and field of study 'Physics' already exists",
      );
      expect(educationRepo.update).not.toHaveBeenCalled();
    });

    it('should allow idempotent updates with same composite key and id', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Same composite key',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      await expect(service.execute(input)).resolves.toBeDefined();
      expect(educationRepo.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException when startDate is in future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: futureDate,
        description: 'Future date',
        location: 'Cambridge, MA',
        status: EducationStatus.IN_PROGRESS,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'Start date cannot be in the future',
      );
    });

    it('should throw BadRequestException when startDate >= endDate', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2022-12-31'),
        endDate: new Date('2022-06-01'),
        description: 'Invalid dates',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'Start date must be before end date',
      );
    });

    it('should throw BadRequestException when IN_PROGRESS has endDate', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2023-01-01',
        endDate: '2024-12-31',
        description: 'Invalid IN_PROGRESS',
        location: 'Cambridge, MA',
        status: EducationStatus.IN_PROGRESS,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'IN_PROGRESS education must have null end date',
      );
    });

    it('should throw BadRequestException when COMPLETED has no endDate', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-01',
        description: 'Invalid COMPLETED',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'completed education must have an end date',
      );
    });

    it('should throw BadRequestException when DROPPED has no endDate', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-01',
        description: 'Invalid DROPPED',
        location: 'Cambridge, MA',
        status: EducationStatus.DROPPED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
      await expect(service.execute(input)).rejects.toThrow(
        'dropped education must have an end date',
      );
    });

    it('should convert date strings to Date objects', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-09-01',
        endDate: '2022-05-31',
        description: 'Date conversion test',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      const updateCall = educationRepo.update.mock.calls[0][0];
      expect(updateCall.startDate).toBeInstanceOf(Date);
      expect(updateCall.endDate).toBeInstanceOf(Date);
      expect(updateCall.startDate.getFullYear()).toBe(2020);
      expect(updateCall.endDate?.getFullYear()).toBe(2022);
    });

    it('should update isHighlighted field', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'Updated',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: true,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isHighlighted: true,
        }),
      );
    });

    it('should update achievements to empty array when not provided', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-15',
        endDate: '2022-06-30',
        description: 'No achievements',
        location: 'Cambridge, MA',
        status: EducationStatus.COMPLETED,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          achievements: [],
        }),
      );
    });

    it('should update IN_PROGRESS education with null endDate', async () => {
      const input = {
        id: 'edu-123',
        institution: 'MIT',
        degreeType: DegreeType.MASTER,
        fieldOfStudy: 'Computer Science',
        startDate: '2023-01-01',
        description: 'Currently pursuing',
        location: 'Cambridge, MA',
        status: EducationStatus.IN_PROGRESS,
        isHighlighted: false,
      };

      educationRepo.findById.mockResolvedValue(existingEducation);
      educationRepo.findByCompositeKeyExcludingId.mockResolvedValue(null);
      educationRepo.update.mockImplementation((edu) => Promise.resolve(edu));

      await service.execute(input);

      expect(educationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EducationStatus.IN_PROGRESS,
          endDate: null,
        }),
      );
    });
  });
});
