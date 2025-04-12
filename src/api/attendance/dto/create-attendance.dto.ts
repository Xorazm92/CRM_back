
import { IsDate, IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

export class CreateAttendanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty({ required: false })
  @IsString()
  notes?: string;
}
