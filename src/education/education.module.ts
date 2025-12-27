import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import educationConfig from './education.config';

// Domain services
import { EducationSortingService } from './domain/services/education-sorting.service';

// Application ports (inbound)
import { GetEducationUseCase } from './application/ports/inbound/get-education.use-case';
import { GetHighlightedEducationUseCase } from './application/ports/inbound/get-highlighted-education.use-case';
import { GetInProgressEducationUseCase } from './application/ports/inbound/get-in-progress-education.use-case';

// Application ports (outbound)
import { EducationRepositoryPort } from './application/ports/outbound/education.repository.port';

// Application services
import { GetEducationService } from './application/services/get-education.service';
import { GetHighlightedEducationService } from './application/services/get-highlighted-education.service';
import { GetInProgressEducationService } from './application/services/get-in-progress-education.service';

// Infrastructure adapters (outbound)
import { InMemoryEducationRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-education.repository';

// Infrastructure adapters (inbound)
import { EducationController } from './infrastructure/adapters/inbound/rest/education.controller';
import { EducationMapper } from './infrastructure/adapters/inbound/mappers/education.mapper';

@Module({})
export class EducationModule {
  static forRoot(): DynamicModule {
    return {
      module: EducationModule,
      imports: [ConfigModule.forFeature(educationConfig)],
      providers: [
        // Domain services
        EducationSortingService,

        // Application services (use cases) - bind abstract to concrete
        { provide: GetEducationUseCase, useClass: GetEducationService },
        {
          provide: GetHighlightedEducationUseCase,
          useClass: GetHighlightedEducationService,
        },
        {
          provide: GetInProgressEducationUseCase,
          useClass: GetInProgressEducationService,
        },

        // Outbound adapters (repositories)
        {
          provide: EducationRepositoryPort,
          useClass: InMemoryEducationRepository,
        },

        // Mappers
        EducationMapper,
      ],
      controllers: [EducationController],
    };
  }
}
