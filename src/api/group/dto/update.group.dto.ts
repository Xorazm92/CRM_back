import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength, IsNotEmpty, Matches, IsUUID, IsOptional } from 'class-validator';

export class UpdateGroupDto {
  @ApiProperty({
    description: 'Name of the group',
    example: 'Group 1',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'Description of the group',
    example: 'Web Development Group 1',
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Teacher ID that this group belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @ApiProperty({
    description: 'Status of the group',
    enum: ['ACTIVE', 'INACTIVE', 'COMPLETED'],
    example: 'ACTIVE',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(ACTIVE|INACTIVE|COMPLETED)$/)
  status?: string;

  @ApiProperty({
    description: 'Course ID that this group belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  course_id?: string;
}
