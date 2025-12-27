import { Controller, Get, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GetProfileUseCase } from '../../../../application/ports/inbound/get-profile.use-case';
import { ProfileMapper } from '../mappers/profile.mapper';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly profileMapper: ProfileMapper,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Profile not found' })
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
