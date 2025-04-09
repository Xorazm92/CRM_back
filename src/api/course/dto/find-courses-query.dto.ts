import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class FindCoursesQueryDto {
  @ApiProperty({
    description: 'Filter courses by status',
    enum: CourseStatus,
    required: false,
    example: 'ACTIVE'
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({
    description: 'Search courses by name or description',
    required: false,
    example: 'development'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
