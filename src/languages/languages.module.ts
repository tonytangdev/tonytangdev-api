import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
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

// Infrastructure adapters (outbound) - In-Memory
import { InMemoryLanguageRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-language.repository';

// Infrastructure adapters (outbound) - TypeORM
import { TypeOrmLanguageRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-language.repository';
import { LanguageOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/language.entity.orm';

// Infrastructure adapters (outbound) - Mongoose
import { MongooseLanguageRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-language.repository';
import {
  LanguageSchema,
  LanguageMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/language.schema';

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
    const configService = new ConfigService();
    const strategy =
      configService.get('LANGUAGES_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: any[] = [ConfigModule.forFeature(languagesConfig)];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          { name: LanguageSchema.name, schema: LanguageMongooseSchema },
        ]),
      );
      repoProviders.push({
        provide: LanguageRepositoryPort,
        useClass: MongooseLanguageRepository,
      });
    } else if (strategy === 'inmemory') {
      repoProviders.push({
        provide: LanguageRepositoryPort,
        useClass: InMemoryLanguageRepository,
      });
    } else {
      imports.push(TypeOrmModule.forFeature([LanguageOrm]));
      repoProviders.push({
        provide: LanguageRepositoryPort,
        useClass: TypeOrmLanguageRepository,
      });
    }

    return {
      module: LanguagesModule,
      imports,
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
        ...repoProviders,

        // Mappers
        LanguageMapper,
      ],
      controllers: [LanguagesController],
    };
  }
}
