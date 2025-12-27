import { Controller, Get, NotFoundException } from '@nestjs/common';
import { GetProfileUseCase } from '../../../../application/ports/inbound/get-profile.use-case';
import { ProfileMapper } from '../mappers/profile.mapper';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly profileMapper: ProfileMapper,
  ) {}

  @Get()
  async getProfile() {
    const profile = await this.getProfileUseCase.execute();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const data = this.profileMapper.toDto(profile);

    return {
      data,
      meta: {},
    };
  }
}
