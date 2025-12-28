import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import experiencesConfig from './experiences.config';

// Domain services
import { ExperienceSortingService } from './domain/services/experience-sorting.service';

// Application ports (inbound)
import { GetExperiencesUseCase } from './application/ports/inbound/get-experiences.use-case';
import { GetHighlightedExperiencesUseCase } from './application/ports/inbound/get-highlighted-experiences.use-case';
import { GetCurrentExperienceUseCase } from './application/ports/inbound/get-current-experience.use-case';
import { CreateExperienceUseCase } from './application/ports/inbound/create-experience.use-case';

// Application ports (outbound)
import { ExperienceRepositoryPort } from './application/ports/outbound/experience.repository.port';

// Application services
import { GetExperiencesService } from './application/services/get-experiences.service';
import { GetHighlightedExperiencesService } from './application/services/get-highlighted-experiences.service';
import { GetCurrentExperienceService } from './application/services/get-current-experience.service';
import { CreateExperienceService } from './application/services/create-experience.service';

// Infrastructure adapters (outbound) - In-Memory
import { InMemoryExperienceRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-experience.repository';

// Infrastructure adapters (outbound) - TypeORM
import { TypeOrmExperienceRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-experience.repository';
import { ExperienceOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/experience.entity.orm';

// Infrastructure adapters (outbound) - Mongoose
import { MongooseExperienceRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-experience.repository';
import {
  ExperienceSchema,
  ExperienceMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/experience.schema';

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
          provide: CreateExperienceUseCase,
          useClass: CreateExperienceService,
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
    const configService = new ConfigService();
    const strategy: string =
      configService.get('EXPERIENCES_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: DynamicModule[] = [
      ConfigModule.forFeature(experiencesConfig),
    ];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          { name: ExperienceSchema.name, schema: ExperienceMongooseSchema },
        ]),
      );
      repoProviders.push({
        provide: ExperienceRepositoryPort,
        useClass: MongooseExperienceRepository,
      });
    } else if (strategy === 'inmemory') {
      repoProviders.push({
        provide: ExperienceRepositoryPort,
        useClass: InMemoryExperienceRepository,
      });
    } else {
      imports.push(TypeOrmModule.forFeature([ExperienceOrm]));
      repoProviders.push({
        provide: ExperienceRepositoryPort,
        useClass: TypeOrmExperienceRepository,
      });
    }

    return {
      module: ExperiencesModule,
      imports,
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
        {
          provide: CreateExperienceUseCase,
          useClass: CreateExperienceService,
        },

        // Outbound adapters (repositories)
        ...repoProviders,

        // Mappers
        ExperienceMapper,
      ],
      controllers: [ExperiencesController],
    };
  }
}
