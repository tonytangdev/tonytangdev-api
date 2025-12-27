import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import refactoringsConfig from './refactorings.config';
import { GetRefactoringShowcasesUseCase } from './application/ports/inbound/get-refactoring-showcases.use-case';
import { GetRefactoringShowcaseByIdUseCase } from './application/ports/inbound/get-refactoring-showcase-by-id.use-case';
import { GetHighlightedRefactoringShowcasesUseCase } from './application/ports/inbound/get-highlighted-refactoring-showcases.use-case';
import { GetRefactoringShowcasesService } from './application/services/get-refactoring-showcases.service';
import { GetRefactoringShowcaseByIdService } from './application/services/get-refactoring-showcase-by-id.service';
import { GetHighlightedRefactoringShowcasesService } from './application/services/get-highlighted-refactoring-showcases.service';
import { RefactoringShowcaseRepositoryPort } from './application/ports/outbound/refactoring-showcase.repository.port';
import { InMemoryRefactoringShowcaseRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-refactoring-showcase.repository';
import { TypeOrmRefactoringShowcaseRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-refactoring-showcase.repository';
import { RefactoringShowcaseOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/refactoring-showcase.entity.orm';
import { RefactoringStepOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/refactoring-step.entity.orm';
import { RefactoringFileOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/refactoring-file.entity.orm';
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
          provide: RefactoringShowcaseRepositoryPort,
          useClass: InMemoryRefactoringShowcaseRepository,
        },
        RefactoringShowcaseMapper,
      ],
      controllers: [RefactoringsController],
    };
  }

  static forRoot(): DynamicModule {
    return {
      module: RefactoringsModule,
      imports: [
        ConfigModule.forFeature(refactoringsConfig),
        TypeOrmModule.forFeature([
          RefactoringShowcaseOrm,
          RefactoringStepOrm,
          RefactoringFileOrm,
        ]),
      ],
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
          provide: RefactoringShowcaseRepositoryPort,
          useClass: TypeOrmRefactoringShowcaseRepository,
        },
        RefactoringShowcaseMapper,
      ],
      controllers: [RefactoringsController],
    };
  }
}
