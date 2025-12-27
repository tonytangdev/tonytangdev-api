import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSkillCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Frontend Frameworks',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
