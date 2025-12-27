import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import profileConfig from './profile.config';

// Application ports (inbound)
import { GetProfileUseCase } from './application/ports/inbound/get-profile.use-case';

// Application ports (outbound)
import { ProfileRepositoryPort } from './application/ports/outbound/profile.repository.port';

// Application services
import { GetProfileService } from './application/services/get-profile.service';

// Infrastructure adapters (outbound)
import { InMemoryProfileRepository } from './infrastructure/adapters/outbound/persistence/in-memory/in-memory-profile.repository';

// Infrastructure adapters (inbound)
import { ProfileController } from './infrastructure/adapters/inbound/rest/profile.controller';
import { ProfileMapper } from './infrastructure/adapters/inbound/mappers/profile.mapper';

@Module({})
export class ProfileModule {
  static forRoot(): DynamicModule {
    return {
      module: ProfileModule,
      imports: [ConfigModule.forFeature(profileConfig)],
      providers: [
        // Application services (use cases) - bind abstract to concrete
        { provide: GetProfileUseCase, useClass: GetProfileService },

        // Outbound adapters (repositories)
        {
          provide: ProfileRepositoryPort,
          useClass: InMemoryProfileRepository,
        },

        // Mappers
        ProfileMapper,
      ],
      controllers: [ProfileController],
    };
  }
}
