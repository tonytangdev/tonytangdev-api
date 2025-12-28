import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import educationConfig from './education.config';

// Domain services
import { EducationSortingService } from './domain/services/education-sorting.service';

// Application ports (inbound)
import { GetEducationUseCase } from './application/ports/inbound/get-education.use-case';
import { GetHighlightedEducationUseCase } from './application/ports/inbound/get-highlighted-education.use-case';
import { GetInProgressEducationUseCase } from './application/ports/inbound/get-in-progress-education.use-case';
import { CreateEducationUseCase } from './application/ports/inbound/create-education.use-case';

// Application ports (outbound)
import { EducationRepositoryPort } from './application/ports/outbound/education.repository.port';

// Application services
import { GetEducationService } from './application/services/get-education.service';
import { GetHighlightedEducationService } from './application/services/get-highlighted-education.service';
import { GetInProgressEducationService } from './application/services/get-in-progress-education.service';
import { CreateEducationService } from './application/services/create-education.service';

// Infrastructure adapters (outbound) - In-Memory
import { InMemoryEducationRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-education.repository';

// Infrastructure adapters (outbound) - TypeORM
import { TypeOrmEducationRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-education.repository';
import { EducationOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/education.entity.orm';

// Infrastructure adapters (outbound) - Mongoose
import { MongooseEducationRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-education.repository';
import {
  EducationSchema,
  EducationMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/education.schema';

// Infrastructure adapters (inbound)
import { EducationController } from './infrastructure/adapters/inbound/rest/education.controller';
import { EducationMapper } from './infrastructure/adapters/inbound/mappers/education.mapper';

@Module({})
export class EducationModule {
  static forTest(): DynamicModule {
    return {
      module: EducationModule,
      imports: [ConfigModule.forFeature(educationConfig)],
      providers: [
        EducationSortingService,
        { provide: GetEducationUseCase, useClass: GetEducationService },
        {
          provide: GetHighlightedEducationUseCase,
          useClass: GetHighlightedEducationService,
        },
        {
          provide: GetInProgressEducationUseCase,
          useClass: GetInProgressEducationService,
        },
        {
          provide: CreateEducationUseCase,
          useClass: CreateEducationService,
        },
        {
          provide: EducationRepositoryPort,
          useClass: InMemoryEducationRepository,
        },
        EducationMapper,
      ],
      controllers: [EducationController],
    };
  }

  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const strategy: string =
      configService.get('EDUCATION_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: DynamicModule[] = [ConfigModule.forFeature(educationConfig)];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          { name: EducationSchema.name, schema: EducationMongooseSchema },
        ]),
      );
      repoProviders.push({
        provide: EducationRepositoryPort,
        useClass: MongooseEducationRepository,
      });
    } else if (strategy === 'inmemory') {
      repoProviders.push({
        provide: EducationRepositoryPort,
        useClass: InMemoryEducationRepository,
      });
    } else {
      imports.push(TypeOrmModule.forFeature([EducationOrm]));
      repoProviders.push({
        provide: EducationRepositoryPort,
        useClass: TypeOrmEducationRepository,
      });
    }

    return {
      module: EducationModule,
      imports,
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
        {
          provide: CreateEducationUseCase,
          useClass: CreateEducationService,
        },

        // Outbound adapters (repositories)
        ...repoProviders,

        // Mappers
        EducationMapper,
      ],
      controllers: [EducationController],
    };
  }
}
