import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({
    description: 'Price of the course',
    example: 1500000,
    required: false,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;
}
