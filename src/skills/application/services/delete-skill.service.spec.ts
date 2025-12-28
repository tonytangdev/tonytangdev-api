import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteSkillService } from './delete-skill.service';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { Skill } from '../../domain/entities/skill.entity';
import { ProficiencyLevel } from '../../domain/value-objects/proficiency-level.vo';

describe('DeleteSkillService', () => {
  let service: DeleteSkillService;
  let skillRepo: jest.Mocked<SkillRepositoryPort>;

  beforeEach(async () => {
    const mockSkillRepo = {
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findHighlighted: jest.fn(),
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      getMaxOrder: jest.fn(),
      update: jest.fn(),
      findByNameExcludingId: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSkillService,
        { provide: SkillRepositoryPort, useValue: mockSkillRepo },
      ],
    }).compile();

    service = module.get<DeleteSkillService>(DeleteSkillService);
    skillRepo = module.get(SkillRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete skill successfully', async () => {
    const existingSkill = new Skill({
      id: 'skill-1',
      name: 'TypeScript',
      categoryId: 'cat-1',
      proficiency: ProficiencyLevel.ADVANCED,
      yearsOfExperience: 5,
      order: 1,
      isHighlighted: true,
    });

    skillRepo.findById.mockResolvedValue(existingSkill);
    skillRepo.delete.mockResolvedValue(undefined);

    await service.execute({ id: 'skill-1' });

    expect(skillRepo.findById).toHaveBeenCalledWith('skill-1');
    expect(skillRepo.delete).toHaveBeenCalledWith('skill-1');
  });

  it('should throw NotFoundException when skill not found', async () => {
    skillRepo.findById.mockResolvedValue(null);

    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute({ id: 'non-existent' })).rejects.toThrow(
      "Skill with id 'non-existent' not found",
    );

    expect(skillRepo.findById).toHaveBeenCalledWith('non-existent');
    expect(skillRepo.delete).not.toHaveBeenCalled();
  });
});
