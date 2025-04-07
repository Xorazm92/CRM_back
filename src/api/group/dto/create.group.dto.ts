import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'name of group',
    minLength: 3,
    maxLength: 50,
    example: 'N14',
  })
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  name: string;

  @ApiProperty({
    description: 'description of group',
    minLength: 10,
    example: 'There are very clever student in the world!',
  })
  @MinLength(10)
  @IsString()
  description: string;
}
