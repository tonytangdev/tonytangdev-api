import {
  Controller,
  Get,
  Post,
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
import { ProfileMapper } from '../mappers/profile.mapper';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ApiKeyGuard } from '../../../../../common/guards/api-key.guard';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly createProfileUseCase: CreateProfileUseCase,
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
}
