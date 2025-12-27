import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import skillsConfig from './skills.config';

// Domain services
import { SkillGroupingService } from './domain/services/skill-grouping.service';

// Application ports (inbound)
import { GetSkillsUseCase } from './application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from './application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from './application/ports/inbound/get-highlighted-skills.use-case';

// Application ports (outbound)
import { SkillRepositoryPort } from './application/ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from './application/ports/outbound/skill-category.repository.port';

// Application services
import { GetSkillsService } from './application/services/get-skills.service';
import { GetSkillsByCategoryService } from './application/services/get-skills-by-category.service';
import { GetHighlightedSkillsService } from './application/services/get-highlighted-skills.service';

// Infrastructure adapters (outbound)
import { InMemorySkillRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-skill.repository';
import { InMemorySkillCategoryRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-skill-category.repository';

// Infrastructure adapters (inbound)
import { SkillsController } from './infrastructure/adapters/inbound/rest/skills.controller';
import { SkillMapper } from './infrastructure/adapters/inbound/mappers/skill.mapper';

@Module({})
export class SkillsModule {
  static forRoot(): DynamicModule {
    return {
      module: SkillsModule,
      imports: [ConfigModule.forFeature(skillsConfig)],
      providers: [
        // Domain services
        SkillGroupingService,

        // Application services (use cases) - bind abstract to concrete
        { provide: GetSkillsUseCase, useClass: GetSkillsService },
        {
          provide: GetSkillsByCategoryUseCase,
          useClass: GetSkillsByCategoryService,
        },
        {
          provide: GetHighlightedSkillsUseCase,
          useClass: GetHighlightedSkillsService,
        },

        // Outbound adapters (repositories)
        { provide: SkillRepositoryPort, useClass: InMemorySkillRepository },
        {
          provide: SkillCategoryRepositoryPort,
          useClass: InMemorySkillCategoryRepository,
        },

        // Mappers
        SkillMapper,
      ],
      controllers: [SkillsController],
    };
  }
}
