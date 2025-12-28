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

  async create(profile: Profile): Promise<Profile> {
    this.profile = profile;
    return Promise.resolve(profile);
  }

  async update(profile: Profile): Promise<Profile> {
    if (!this.profile) {
      throw new Error('Profile not found');
    }
    this.profile = profile;
    return Promise.resolve(profile);
  }
}
