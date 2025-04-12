
import { IsDate, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @ApiProperty({ description: "O'quvchi ID" })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ description: "Guruh ID" })
  @IsString()
  @IsNotEmpty()
  lesson_id: string;

  @ApiProperty({ 
    enum: AttendanceStatus,
    description: "Davomat holati: PRESENT, ABSENT, LATE, EXCUSED" 
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ description: "Izoh", required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
