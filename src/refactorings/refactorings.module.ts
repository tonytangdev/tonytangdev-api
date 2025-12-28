import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import refactoringsConfig from './refactorings.config';
import { GetRefactoringShowcasesUseCase } from './application/ports/inbound/get-refactoring-showcases.use-case';
import { GetRefactoringShowcaseByIdUseCase } from './application/ports/inbound/get-refactoring-showcase-by-id.use-case';
import { GetHighlightedRefactoringShowcasesUseCase } from './application/ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { CreateRefactoringShowcaseUseCase } from './application/ports/inbound/create-refactoring-showcase.use-case';
import { UpdateRefactoringShowcaseUseCase } from './application/ports/inbound/update-refactoring-showcase.use-case';
import { PatchRefactoringShowcaseUseCase } from './application/ports/inbound/patch-refactoring-showcase.use-case';
import { DeleteRefactoringShowcaseUseCase } from './application/ports/inbound/delete-refactoring-showcase.use-case';
import { GetRefactoringShowcasesService } from './application/services/get-refactoring-showcases.service';
import { GetRefactoringShowcaseByIdService } from './application/services/get-refactoring-showcase-by-id.service';
import { GetHighlightedRefactoringShowcasesService } from './application/services/get-highlighted-refactoring-showcases.service';
import { CreateRefactoringShowcaseService } from './application/services/create-refactoring-showcase.service';
import { UpdateRefactoringShowcaseService } from './application/services/update-refactoring-showcase.service';
import { PatchRefactoringShowcaseService } from './application/services/patch-refactoring-showcase.service';
import { DeleteRefactoringShowcaseService } from './application/services/delete-refactoring-showcase.service';
import { RefactoringShowcaseRepositoryPort } from './application/ports/outbound/refactoring-showcase.repository.port';
import { InMemoryRefactoringShowcaseRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-refactoring-showcase.repository';
import { TypeOrmRefactoringShowcaseRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-refactoring-showcase.repository';
import { RefactoringShowcaseOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/refactoring-showcase.entity.orm';
import { RefactoringStepOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/refactoring-step.entity.orm';
import { RefactoringFileOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/refactoring-file.entity.orm';
import { MongooseRefactoringShowcaseRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-refactoring-showcase.repository';
import {
  RefactoringShowcaseSchema,
  RefactoringShowcaseMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/refactoring-showcase.schema';
import { RefactoringShowcaseMapper } from './infrastructure/adapters/inbound/mappers/refactoring-showcase.mapper';
import { RefactoringsController } from './infrastructure/adapters/inbound/rest/refactorings.controller';

@Module({})
export class RefactoringsModule {
  static forTest(): DynamicModule {
    return {
      module: RefactoringsModule,
      imports: [ConfigModule.forFeature(refactoringsConfig)],
      providers: [
        {
          provide: GetRefactoringShowcasesUseCase,
          useClass: GetRefactoringShowcasesService,
        },
        {
          provide: GetRefactoringShowcaseByIdUseCase,
          useClass: GetRefactoringShowcaseByIdService,
        },
        {
          provide: GetHighlightedRefactoringShowcasesUseCase,
          useClass: GetHighlightedRefactoringShowcasesService,
        },
        {
          provide: CreateRefactoringShowcaseUseCase,
          useClass: CreateRefactoringShowcaseService,
        },
        {
          provide: UpdateRefactoringShowcaseUseCase,
          useClass: UpdateRefactoringShowcaseService,
        },
        {
          provide: PatchRefactoringShowcaseUseCase,
          useClass: PatchRefactoringShowcaseService,
        },
        {
          provide: DeleteRefactoringShowcaseUseCase,
          useClass: DeleteRefactoringShowcaseService,
        },
        {
          provide: RefactoringShowcaseRepositoryPort,
          useClass: InMemoryRefactoringShowcaseRepository,
        },
        RefactoringShowcaseMapper,
      ],
      controllers: [RefactoringsController],
    };
  }

  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const strategy: string =
      configService.get('REFACTORINGS_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: DynamicModule[] = [
      ConfigModule.forFeature(refactoringsConfig),
    ];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          {
            name: RefactoringShowcaseSchema.name,
            schema: RefactoringShowcaseMongooseSchema,
          },
        ]),
      );
      repoProviders.push({
        provide: RefactoringShowcaseRepositoryPort,
        useClass: MongooseRefactoringShowcaseRepository,
      });
    } else if (strategy === 'inmemory') {
      repoProviders.push({
        provide: RefactoringShowcaseRepositoryPort,
        useClass: InMemoryRefactoringShowcaseRepository,
      });
    } else {
      imports.push(
        TypeOrmModule.forFeature([
          RefactoringShowcaseOrm,
          RefactoringStepOrm,
          RefactoringFileOrm,
        ]),
      );
      repoProviders.push({
        provide: RefactoringShowcaseRepositoryPort,
        useClass: TypeOrmRefactoringShowcaseRepository,
      });
    }

    return {
      module: RefactoringsModule,
      imports,
      providers: [
        {
          provide: GetRefactoringShowcasesUseCase,
          useClass: GetRefactoringShowcasesService,
        },
        {
          provide: GetRefactoringShowcaseByIdUseCase,
          useClass: GetRefactoringShowcaseByIdService,
        },
        {
          provide: GetHighlightedRefactoringShowcasesUseCase,
          useClass: GetHighlightedRefactoringShowcasesService,
        },
        {
          provide: CreateRefactoringShowcaseUseCase,
          useClass: CreateRefactoringShowcaseService,
        },
        {
          provide: UpdateRefactoringShowcaseUseCase,
          useClass: UpdateRefactoringShowcaseService,
        },
        {
          provide: PatchRefactoringShowcaseUseCase,
          useClass: PatchRefactoringShowcaseService,
        },
        {
          provide: DeleteRefactoringShowcaseUseCase,
          useClass: DeleteRefactoringShowcaseService,
        },
        ...repoProviders,
        RefactoringShowcaseMapper,
      ],
      controllers: [RefactoringsController],
    };
  }
}
