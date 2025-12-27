import { Test, TestingModule } from '@nestjs/testing';
import { GetHighlightedSkillsService } from './get-highlighted-skills.service';
import { SkillRepositoryPort } from '../ports/outbound/skill.repository.port';
import { Skill } from '../../domain/entities/skill.entity';
import { ProficiencyLevel } from '../../domain/value-objects/proficiency-level.vo';

describe('GetHighlightedSkillsService', () => {
  let service: GetHighlightedSkillsService;
  let skillRepo: jest.Mocked<SkillRepositoryPort>;

  beforeEach(async () => {
    const mockSkillRepo = {
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findHighlighted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHighlightedSkillsService,
        { provide: SkillRepositoryPort, useValue: mockSkillRepo },
      ],
    }).compile();

    service = module.get<GetHighlightedSkillsService>(
      GetHighlightedSkillsService,
    );
    skillRepo = module.get(SkillRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return highlighted skills', async () => {
    const skills = [
      new Skill('1', 'TypeScript', '1', ProficiencyLevel.EXPERT, 5, 0, true),
      new Skill('2', 'NestJS', '2', ProficiencyLevel.EXPERT, 4, 0, true),
    ];

    skillRepo.findHighlighted.mockResolvedValue(skills);

    const result = await service.execute();

    expect(skillRepo.findHighlighted).toHaveBeenCalled();
    expect(result).toEqual(skills);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no highlighted skills', async () => {
    skillRepo.findHighlighted.mockResolvedValue([]);

    const result = await service.execute();

    expect(skillRepo.findHighlighted).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
