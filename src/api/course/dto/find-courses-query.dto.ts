import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class FindCoursesQueryDto {
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
