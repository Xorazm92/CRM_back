
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Kurs nomi',
    example: 'Web dasturlash'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Kurs haqida ma\'lumot',
    example: 'Frontend va Backend texnologiyalarini o\'rganish'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Kurs davomiyligi (oyda)',
    example: 6,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Kurs narxi',
    example: 1000000
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Kurs holati',
    enum: CourseStatus,
    example: CourseStatus.ACTIVE
  })
  @IsEnum(CourseStatus)
  status: CourseStatus;

  @ApiProperty({
    description: 'O\'qituvchi ID',
    example: 'uuid'
  })
  @IsString()
  @IsNotEmpty() 
  teacher_id: string;

  @ApiProperty({
    description: 'Qo\'shimcha ma\'lumot',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
