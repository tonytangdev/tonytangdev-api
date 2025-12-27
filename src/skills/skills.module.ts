import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import skillsConfig from './skills.config';

// Domain services
import { SkillGroupingService } from './domain/services/skill-grouping.service';

// Application ports (inbound)
import { GetSkillsUseCase } from './application/ports/inbound/get-skills.use-case';
import { GetSkillsByCategoryUseCase } from './application/ports/inbound/get-skills-by-category.use-case';
import { GetHighlightedSkillsUseCase } from './application/ports/inbound/get-highlighted-skills.use-case';
import { CreateSkillUseCase } from './application/ports/inbound/create-skill.use-case';
import { CreateSkillCategoryUseCase } from './application/ports/inbound/create-skill-category.use-case';

// Application ports (outbound)
import { SkillRepositoryPort } from './application/ports/outbound/skill.repository.port';
import { SkillCategoryRepositoryPort } from './application/ports/outbound/skill-category.repository.port';

// Application services
import { GetSkillsService } from './application/services/get-skills.service';
import { GetSkillsByCategoryService } from './application/services/get-skills-by-category.service';
import { GetHighlightedSkillsService } from './application/services/get-highlighted-skills.service';
import { CreateSkillService } from './application/services/create-skill.service';
import { CreateSkillCategoryService } from './application/services/create-skill-category.service';

// Infrastructure adapters (outbound) - In-Memory
import { InMemorySkillRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-skill.repository';
import { InMemorySkillCategoryRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-skill-category.repository';

// Infrastructure adapters (outbound) - TypeORM
import { TypeOrmSkillRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-skill.repository';
import { TypeOrmSkillCategoryRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-skill-category.repository';
import { SkillOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/skill.entity.orm';
import { SkillCategoryOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/skill-category.entity.orm';

// Infrastructure adapters (outbound) - Mongoose
import { MongooseSkillRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-skill.repository';
import { MongooseSkillCategoryRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-skill-category.repository';
import {
  SkillSchema,
  SkillMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/skill.schema';
import {
  SkillCategorySchema,
  SkillCategoryMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/skill-category.schema';

// Infrastructure adapters (inbound)
import { SkillsController } from './infrastructure/adapters/inbound/rest/skills.controller';
import { SkillMapper } from './infrastructure/adapters/inbound/mappers/skill.mapper';

@Module({})
export class SkillsModule {
  static forTest(): DynamicModule {
    return {
      module: SkillsModule,
      imports: [ConfigModule.forFeature(skillsConfig)],
      providers: [
        SkillGroupingService,
        { provide: GetSkillsUseCase, useClass: GetSkillsService },
        {
          provide: GetSkillsByCategoryUseCase,
          useClass: GetSkillsByCategoryService,
        },
        {
          provide: GetHighlightedSkillsUseCase,
          useClass: GetHighlightedSkillsService,
        },
        { provide: CreateSkillUseCase, useClass: CreateSkillService },
        {
          provide: CreateSkillCategoryUseCase,
          useClass: CreateSkillCategoryService,
        },
        { provide: SkillRepositoryPort, useClass: InMemorySkillRepository },
        {
          provide: SkillCategoryRepositoryPort,
          useClass: InMemorySkillCategoryRepository,
        },
        SkillMapper,
      ],
      controllers: [SkillsController],
    };
  }

  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const strategy: string =
      configService.get('SKILLS_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: DynamicModule[] = [ConfigModule.forFeature(skillsConfig)];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          { name: SkillSchema.name, schema: SkillMongooseSchema },
          {
            name: SkillCategorySchema.name,
            schema: SkillCategoryMongooseSchema,
          },
        ]),
      );
      repoProviders.push(
        { provide: SkillRepositoryPort, useClass: MongooseSkillRepository },
        {
          provide: SkillCategoryRepositoryPort,
          useClass: MongooseSkillCategoryRepository,
        },
      );
    } else if (strategy === 'inmemory') {
      repoProviders.push(
        { provide: SkillRepositoryPort, useClass: InMemorySkillRepository },
        {
          provide: SkillCategoryRepositoryPort,
          useClass: InMemorySkillCategoryRepository,
        },
      );
    } else {
      imports.push(TypeOrmModule.forFeature([SkillOrm, SkillCategoryOrm]));
      repoProviders.push(
        { provide: SkillRepositoryPort, useClass: TypeOrmSkillRepository },
        {
          provide: SkillCategoryRepositoryPort,
          useClass: TypeOrmSkillCategoryRepository,
        },
      );
    }

    return {
      module: SkillsModule,
      imports,
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
        { provide: CreateSkillUseCase, useClass: CreateSkillService },
        {
          provide: CreateSkillCategoryUseCase,
          useClass: CreateSkillCategoryService,
        },

        // Outbound adapters (repositories)
        ...repoProviders,

        // Mappers
        SkillMapper,
      ],
      controllers: [SkillsController],
    };
  }
}
