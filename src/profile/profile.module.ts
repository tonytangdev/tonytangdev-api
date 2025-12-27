import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import profileConfig from './profile.config';

// Application ports (inbound)
import { GetProfileUseCase } from './application/ports/inbound/get-profile.use-case';
import { CreateProfileUseCase } from './application/ports/inbound/create-profile.use-case';

// Application ports (outbound)
import { ProfileRepositoryPort } from './application/ports/outbound/profile.repository.port';

// Application services
import { GetProfileService } from './application/services/get-profile.service';
import { CreateProfileService } from './application/services/create-profile.service';

// Infrastructure adapters (outbound) - In-Memory
import { InMemoryProfileRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-profile.repository';

// Infrastructure adapters (outbound) - TypeORM
import { TypeOrmProfileRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-profile.repository';
import { ProfileOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/profile.entity.orm';
import { SocialLinkOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/social-link.entity.orm';

// Infrastructure adapters (outbound) - Mongoose
import { MongooseProfileRepository } from './infrastructure/adapters/outbound/persistence/mongoose/repositories/mongoose-profile.repository';
import {
  ProfileSchema,
  ProfileMongooseSchema,
} from './infrastructure/adapters/outbound/persistence/mongoose/schemas/profile.schema';

// Infrastructure adapters (inbound)
import { ProfileController } from './infrastructure/adapters/inbound/rest/profile.controller';
import { ProfileMapper } from './infrastructure/adapters/inbound/mappers/profile.mapper';

@Module({})
export class ProfileModule {
  static forTest(): DynamicModule {
    return {
      module: ProfileModule,
      imports: [ConfigModule.forFeature(profileConfig)],
      providers: [
        { provide: GetProfileUseCase, useClass: GetProfileService },
        { provide: CreateProfileUseCase, useClass: CreateProfileService },
        {
          provide: ProfileRepositoryPort,
          useClass: InMemoryProfileRepository,
        },
        ProfileMapper,
      ],
      controllers: [ProfileController],
    };
  }

  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const strategy: string =
      configService.get('PROFILE_DATABASE_STRATEGY') ||
      configService.get('DATABASE_STRATEGY') ||
      'typeorm';

    const imports: DynamicModule[] = [ConfigModule.forFeature(profileConfig)];
    const repoProviders: Provider[] = [];

    if (strategy === 'mongoose') {
      imports.push(
        MongooseModule.forFeature([
          { name: ProfileSchema.name, schema: ProfileMongooseSchema },
        ]),
      );
      repoProviders.push({
        provide: ProfileRepositoryPort,
        useClass: MongooseProfileRepository,
      });
    } else if (strategy === 'inmemory') {
      repoProviders.push({
        provide: ProfileRepositoryPort,
        useClass: InMemoryProfileRepository,
      });
    } else {
      imports.push(TypeOrmModule.forFeature([ProfileOrm, SocialLinkOrm]));
      repoProviders.push({
        provide: ProfileRepositoryPort,
        useClass: TypeOrmProfileRepository,
      });
    }

    return {
      module: ProfileModule,
      imports,
      providers: [
        // Application services (use cases) - bind abstract to concrete
        { provide: GetProfileUseCase, useClass: GetProfileService },
        { provide: CreateProfileUseCase, useClass: CreateProfileService },

        // Outbound adapters (repositories)
        ...repoProviders,

        // Mappers
        ProfileMapper,
      ],
      controllers: [ProfileController],
    };
  }
}
