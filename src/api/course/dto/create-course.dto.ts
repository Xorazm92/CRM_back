import { IsNotEmpty, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  duration: number;

  @IsEnum(CourseStatus)
  status: CourseStatus;
}
