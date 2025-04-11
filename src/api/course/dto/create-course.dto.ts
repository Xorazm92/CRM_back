import { IsNotEmpty, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { CourseStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Name of the course',
    example: 'Web Development',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the course',
    example: 'Learn web development from scratch',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Duration of the course in hours',
    example: 120,
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Status of the course',
    enum: CourseStatus,
    example: 'ACTIVE',
  })
  @IsEnum(CourseStatus)
  status: CourseStatus;
}