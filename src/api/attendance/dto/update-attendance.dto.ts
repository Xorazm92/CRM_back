import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @ApiProperty({
    description: "Davomat holati: PRESENT, ABSENT, LATE, EXCUSED",
    enum: AttendanceStatus,
    required: false
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @ApiProperty({ description: "Izoh", required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
