import { Injectable } from '@nestjs/common';
import { GetProfileUseCase } from '../ports/inbound/get-profile.use-case';
import { Profile } from '../../domain/entities/profile.entity';
import { ProfileRepositoryPort } from '../ports/outbound/profile.repository.port';

@Injectable()
export class GetProfileService implements GetProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepositoryPort) {}

  async execute(): Promise<Profile | null> {
    return this.profileRepository.findProfile();
  }
}
