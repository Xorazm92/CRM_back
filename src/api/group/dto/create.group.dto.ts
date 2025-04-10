import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength, IsNotEmpty, Matches, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Name of the group',
    minLength: 2,
    maxLength: 50,
    example: 'N14',
    required: true
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9-_\s]+$/, {
    message: 'Group name can only contain letters, numbers, spaces, hyphens and underscores'
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the group',
    minLength: 10,
    maxLength: 500,
    example: 'Advanced programming group for 2nd year students',
    required: true
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Course ID that this group belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsUUID()
  @IsNotEmpty()
  course_id: string;
}
