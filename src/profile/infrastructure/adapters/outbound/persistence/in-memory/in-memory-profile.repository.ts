import { Injectable } from '@nestjs/common';
import { ProfileRepositoryPort } from '../../../../../application/ports/outbound/profile.repository.port';
import { Profile } from '../../../../../domain/entities/profile.entity';
import { seedProfile } from './seed-data';

@Injectable()
export class InMemoryProfileRepository extends ProfileRepositoryPort {
  private profile: Profile = seedProfile;

  async findProfile(): Promise<Profile | null> {
    return Promise.resolve(this.profile);
  }
}
