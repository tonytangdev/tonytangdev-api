import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import experiencesConfig from './experiences.config';

// Domain services
import { ExperienceSortingService } from './domain/services/experience-sorting.service';

// Application ports (inbound)
import { GetExperiencesUseCase } from './application/ports/inbound/get-experiences.use-case';
import { GetHighlightedExperiencesUseCase } from './application/ports/inbound/get-highlighted-experiences.use-case';
import { GetCurrentExperienceUseCase } from './application/ports/inbound/get-current-experience.use-case';

// Application ports (outbound)
import { ExperienceRepositoryPort } from './application/ports/outbound/experience.repository.port';

// Application services
import { GetExperiencesService } from './application/services/get-experiences.service';
import { GetHighlightedExperiencesService } from './application/services/get-highlighted-experiences.service';
import { GetCurrentExperienceService } from './application/services/get-current-experience.service';

// Infrastructure adapters (outbound)
import { InMemoryExperienceRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-experience.repository';
import { TypeOrmExperienceRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-experience.repository';
import { ExperienceOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/experience.entity.orm';

// Infrastructure adapters (inbound)
import { ExperiencesController } from './infrastructure/adapters/inbound/rest/experiences.controller';
import { ExperienceMapper } from './infrastructure/adapters/inbound/mappers/experience.mapper';

@Module({})
export class ExperiencesModule {
  static forTest(): DynamicModule {
    return {
      module: ExperiencesModule,
      imports: [ConfigModule.forFeature(experiencesConfig)],
      providers: [
        ExperienceSortingService,
        { provide: GetExperiencesUseCase, useClass: GetExperiencesService },
        {
          provide: GetHighlightedExperiencesUseCase,
          useClass: GetHighlightedExperiencesService,
        },
        {
          provide: GetCurrentExperienceUseCase,
          useClass: GetCurrentExperienceService,
        },
        {
          provide: ExperienceRepositoryPort,
          useClass: InMemoryExperienceRepository,
        },
        ExperienceMapper,
      ],
      controllers: [ExperiencesController],
    };
  }

  static forRoot(): DynamicModule {
    return {
      module: ExperiencesModule,
      imports: [
        ConfigModule.forFeature(experiencesConfig),
        TypeOrmModule.forFeature([ExperienceOrm]),
      ],
      providers: [
        // Domain services
        ExperienceSortingService,

        // Application services (use cases) - bind abstract to concrete
        { provide: GetExperiencesUseCase, useClass: GetExperiencesService },
        {
          provide: GetHighlightedExperiencesUseCase,
          useClass: GetHighlightedExperiencesService,
        },
        {
          provide: GetCurrentExperienceUseCase,
          useClass: GetCurrentExperienceService,
        },

        // Outbound adapters (repositories)
        {
          provide: ExperienceRepositoryPort,
          useClass: TypeOrmExperienceRepository,
        },

        // Mappers
        ExperienceMapper,
      ],
      controllers: [ExperiencesController],
    };
  }
}
