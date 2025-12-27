import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import projectsConfig from './projects.config';

// Domain services
import { ProjectSortingService } from './domain/services/project-sorting.service';

// Application ports (inbound)
import { GetProjectsUseCase } from './application/ports/inbound/get-projects.use-case';
import { GetProjectByIdUseCase } from './application/ports/inbound/get-project-by-id.use-case';
import { GetProjectsByTechnologyUseCase } from './application/ports/inbound/get-projects-by-technology.use-case';

// Application ports (outbound)
import { ProjectRepositoryPort } from './application/ports/outbound/project.repository.port';

// Application services
import { GetProjectsService } from './application/services/get-projects.service';
import { GetProjectByIdService } from './application/services/get-project-by-id.service';
import { GetProjectsByTechnologyService } from './application/services/get-projects-by-technology.service';

// Infrastructure adapters (outbound)
import { InMemoryProjectRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-project.repository';
import { TypeOrmProjectRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-project.repository';
import { ProjectOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/project.entity.orm';

// Infrastructure adapters (inbound)
import { ProjectsController } from './infrastructure/adapters/inbound/rest/projects.controller';
import { ProjectMapper } from './infrastructure/adapters/inbound/mappers/project.mapper';

@Module({})
export class ProjectsModule {
  static forTest(): DynamicModule {
    return {
      module: ProjectsModule,
      imports: [ConfigModule.forFeature(projectsConfig)],
      providers: [
        ProjectSortingService,
        { provide: GetProjectsUseCase, useClass: GetProjectsService },
        { provide: GetProjectByIdUseCase, useClass: GetProjectByIdService },
        {
          provide: GetProjectsByTechnologyUseCase,
          useClass: GetProjectsByTechnologyService,
        },
        {
          provide: ProjectRepositoryPort,
          useClass: InMemoryProjectRepository,
        },
        ProjectMapper,
      ],
      controllers: [ProjectsController],
    };
  }

  static forRoot(): DynamicModule {
    return {
      module: ProjectsModule,
      imports: [
        ConfigModule.forFeature(projectsConfig),
        TypeOrmModule.forFeature([ProjectOrm]),
      ],
      providers: [
        // Domain services
        ProjectSortingService,

        // Application services (use cases) - bind abstract to concrete
        { provide: GetProjectsUseCase, useClass: GetProjectsService },
        { provide: GetProjectByIdUseCase, useClass: GetProjectByIdService },
        {
          provide: GetProjectsByTechnologyUseCase,
          useClass: GetProjectsByTechnologyService,
        },

        // Outbound adapters (repositories)
        {
          provide: ProjectRepositoryPort,
          useClass: TypeOrmProjectRepository,
        },

        // Mappers
        ProjectMapper,
      ],
      controllers: [ProjectsController],
    };
  }
}
