import { ApiProperty } from '@nestjs/swagger';

export class SocialLinkResponseDto {
  @ApiProperty({ description: 'Social platform name', example: 'GitHub' })
  platform: string;

  @ApiProperty({
    description: 'Profile URL',
    example: 'https://github.com/tonytangdev',
  })
  url: string;

  @ApiProperty({ description: 'Username', example: 'tonytangdev' })
  username: string;
}
