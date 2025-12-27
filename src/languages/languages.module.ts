import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import languagesConfig from './languages.config';

// Application ports (inbound)
import { GetLanguagesUseCase } from './application/ports/inbound/get-languages.use-case';
import { GetHighlightedLanguagesUseCase } from './application/ports/inbound/get-highlighted-languages.use-case';
import { GetNativeLanguagesUseCase } from './application/ports/inbound/get-native-languages.use-case';

// Application ports (outbound)
import { LanguageRepositoryPort } from './application/ports/outbound/language.repository.port';

// Application services
import { GetLanguagesService } from './application/services/get-languages.service';
import { GetHighlightedLanguagesService } from './application/services/get-highlighted-languages.service';
import { GetNativeLanguagesService } from './application/services/get-native-languages.service';

// Infrastructure adapters (outbound)
import { InMemoryLanguageRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-language.repository';
import { TypeOrmLanguageRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-language.repository';
import { LanguageOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/language.entity.orm';

// Infrastructure adapters (inbound)
import { LanguagesController } from './infrastructure/adapters/inbound/rest/languages.controller';
import { LanguageMapper } from './infrastructure/adapters/inbound/mappers/language.mapper';

@Module({})
export class LanguagesModule {
  static forTest(): DynamicModule {
    return {
      module: LanguagesModule,
      imports: [ConfigModule.forFeature(languagesConfig)],
      providers: [
        { provide: GetLanguagesUseCase, useClass: GetLanguagesService },
        {
          provide: GetHighlightedLanguagesUseCase,
          useClass: GetHighlightedLanguagesService,
        },
        {
          provide: GetNativeLanguagesUseCase,
          useClass: GetNativeLanguagesService,
        },
        {
          provide: LanguageRepositoryPort,
          useClass: InMemoryLanguageRepository,
        },
        LanguageMapper,
      ],
      controllers: [LanguagesController],
    };
  }

  static forRoot(): DynamicModule {
    return {
      module: LanguagesModule,
      imports: [
        ConfigModule.forFeature(languagesConfig),
        TypeOrmModule.forFeature([LanguageOrm]),
      ],
      providers: [
        // Application services (use cases) - bind abstract to concrete
        { provide: GetLanguagesUseCase, useClass: GetLanguagesService },
        {
          provide: GetHighlightedLanguagesUseCase,
          useClass: GetHighlightedLanguagesService,
        },
        {
          provide: GetNativeLanguagesUseCase,
          useClass: GetNativeLanguagesService,
        },

        // Outbound adapters (repositories)
        {
          provide: LanguageRepositoryPort,
          useClass: TypeOrmLanguageRepository,
        },

        // Mappers
        LanguageMapper,
      ],
      controllers: [LanguagesController],
    };
  }
}
