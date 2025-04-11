import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength, IsNotEmpty, Matches, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Name of the group',
    example: 'Group 1',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Description of the group',
    example: 'Web Development Group 1',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Status of the group',
    enum: ['ACTIVE', 'INACTIVE', 'COMPLETED'],
    example: 'ACTIVE',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(ACTIVE|INACTIVE|COMPLETED)$/)
  status: string;

  @ApiProperty({
    description: 'Course ID that this group belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}