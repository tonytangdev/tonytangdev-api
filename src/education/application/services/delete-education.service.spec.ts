import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteEducationService } from './delete-education.service';
import { EducationRepositoryPort } from '../ports/outbound/education.repository.port';
import { Education } from '../../domain/entities/education.entity';
import { DegreeType } from '../../domain/value-objects/degree-type.vo';
import { EducationStatus } from '../../domain/value-objects/education-status.vo';

describe('DeleteEducationService', () => {
  let service: DeleteEducationService;
  let educationRepo: jest.Mocked<EducationRepositoryPort>;

  beforeEach(async () => {
    const mockEducationRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findHighlighted: jest.fn(),
      findInProgress: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByCompositeKey: jest.fn(),
      findByCompositeKeyExcludingId: jest.fn(),
      getMaxOrder: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEducationService,
        { provide: EducationRepositoryPort, useValue: mockEducationRepo },
      ],
    }).compile();

    service = module.get<DeleteEducationService>(DeleteEducationService);
    educationRepo = module.get(EducationRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete education successfully', async () => {
    const existingEducation = new Education({
      id: 'edu-1',
      institution: 'Stanford University',
      degreeType: DegreeType.MASTER,
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2022-06-01'),
      description: 'Master of Science in Computer Science',
      achievements: [],
      location: 'Stanford, CA',
      status: EducationStatus.COMPLETED,
      isHighlighted: true,
      order: 0,
    });

    educationRepo.findById.mockResolvedValue(existingEducation);
    educationRepo.delete.mockResolvedValue(undefined);

    await service.execute({ id: 'edu-1' });

    expect(educationRepo.findById).toHaveBeenCalledWith('edu-1');
    expect(educationRepo.delete).toHaveBeenCalledWith('edu-1');
  });

  it('should throw NotFoundException when education not found', async () => {
    educationRepo.findById.mockResolvedValue(null);

    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      "Education with id 'non-existent' not found",
    );

    expect(educationRepo.findById).toHaveBeenCalledWith('non-existent');
    expect(educationRepo.delete).not.toHaveBeenCalled();
  });
});
