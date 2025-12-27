import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import profileConfig from './profile.config';

// Application ports (inbound)
import { GetProfileUseCase } from './application/ports/inbound/get-profile.use-case';

// Application ports (outbound)
import { ProfileRepositoryPort } from './application/ports/outbound/profile.repository.port';

// Application services
import { GetProfileService } from './application/services/get-profile.service';

// Infrastructure adapters (outbound)
import { InMemoryProfileRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-profile.repository';
import { TypeOrmProfileRepository } from './infrastructure/adapters/outbound/persistence/typeorm/repositories/typeorm-profile.repository';
import { ProfileOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/profile.entity.orm';
import { SocialLinkOrm } from './infrastructure/adapters/outbound/persistence/typeorm/entities/social-link.entity.orm';

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
    return {
      module: ProfileModule,
      imports: [
        ConfigModule.forFeature(profileConfig),
        TypeOrmModule.forFeature([ProfileOrm, SocialLinkOrm]),
      ],
      providers: [
        // Application services (use cases) - bind abstract to concrete
        { provide: GetProfileUseCase, useClass: GetProfileService },

        // Outbound adapters (repositories)
        {
          provide: ProfileRepositoryPort,
          useClass: TypeOrmProfileRepository,
        },

        // Mappers
        ProfileMapper,
      ],
      controllers: [ProfileController],
    };
  }
}
