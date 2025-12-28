import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetProfileUseCase } from '../../../../application/ports/inbound/get-profile.use-case';
import { CreateProfileUseCase } from '../../../../application/ports/inbound/create-profile.use-case';
import { UpdateProfileUseCase } from '../../../../application/ports/inbound/update-profile.use-case';
import { ProfileMapper } from '../mappers/profile.mapper';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
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

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  @ApiBody({ type: CreateProfileDto })
  @ApiBearerAuth('api-key')
  async createProfile(@Body() dto: CreateProfileDto) {
    const profile = await this.createProfileUseCase.execute(dto);
    const data = this.profileMapper.toDto(profile);
    return { data, meta: {} };
  }

  @Patch()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Update profile (partial)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiBearerAuth('api-key')
  async updateProfile(@Body() dto: UpdateProfileDto) {
    const profile = await this.updateProfileUseCase.execute(dto);
    const data = this.profileMapper.toDto(profile);
    return { data, meta: {} };
  }
}
