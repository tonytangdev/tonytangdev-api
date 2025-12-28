import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import projectsConfig from './projects.config';

// Domain services
import { ProjectSortingService } from './domain/services/project-sorting.service';

// Application ports (inbound)
import { GetProjectsUseCase } from './application/ports/inbound/get-projects.use-case';
import { GetProjectByIdUseCase } from './application/ports/inbound/get-project-by-id.use-case';
import { GetProjectsByTechnologyUseCase } from './application/ports/inbound/get-projects-by-technology.use-case';
import { CreateProjectUseCase } from './application/ports/inbound/create-project.use-case';
import { UpdateProjectUseCase } from './application/ports/inbound/update-project.use-case';
import { DeleteProjectUseCase } from './application/ports/inbound/delete-project.use-case';

// Application ports (outbound)
import { ProjectRepositoryPort } from './application/ports/outbound/project.repository.port';

// Application services
import { GetProjectsService } from './application/services/get-projects.service';
import { GetProjectByIdService } from './application/services/get-project-by-id.service';
import { GetProjectsByTechnologyService } from './application/services/get-projects-by-technology.service';
import { CreateProjectService } from './application/services/create-project.service';
import { UpdateProjectService } from './application/services/update-project.service';
import { DeleteProjectService } from './application/services/delete-project.service';

// Infrastructure adapters (outbound) - In-Memory
import { InMemoryProjectRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-project.repository';

// Infrastructure adapters (outbound) - TypeORM
import { TypeOrmProjectRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-project.repository';
import { ProjectOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/project.entity.orm';

// Infrastructure adapters (outbound) - Mongoose
import { MongooseProjectRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-project.repository';
import {
  ProjectSchema,
  ProjectMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/project.schema';

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
        { provide: CreateProjectUseCase, useClass: CreateProjectService },
        { provide: UpdateProjectUseCase, useClass: UpdateProjectService },
        { provide: DeleteProjectUseCase, useClass: DeleteProjectService },
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
    const configService = new ConfigService();
    const strategy: string =
      configService.get('PROJECTS_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: DynamicModule[] = [ConfigModule.forFeature(projectsConfig)];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          { name: ProjectSchema.name, schema: ProjectMongooseSchema },
        ]),
      );
      repoProviders.push({
        provide: ProjectRepositoryPort,
        useClass: MongooseProjectRepository,
      });
    } else if (strategy === 'inmemory') {
      repoProviders.push({
        provide: ProjectRepositoryPort,
        useClass: InMemoryProjectRepository,
      });
    } else {
      imports.push(TypeOrmModule.forFeature([ProjectOrm]));
      repoProviders.push({
        provide: ProjectRepositoryPort,
        useClass: TypeOrmProjectRepository,
      });
    }

    return {
      module: ProjectsModule,
      imports,
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
        { provide: CreateProjectUseCase, useClass: CreateProjectService },
        { provide: UpdateProjectUseCase, useClass: UpdateProjectService },
        { provide: DeleteProjectUseCase, useClass: DeleteProjectService },

        // Outbound adapters (repositories)
        ...repoProviders,

        // Mappers
        ProjectMapper,
      ],
      controllers: [ProjectsController],
    };
  }
}
