import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Create attendance record' })
  @ApiBody({ type: CreateAttendanceDto, examples: {
    default: {
      value: {
        student_id: '7a2f9f98-9b77-423b-944e-b32d2f5d15c8',
        lesson_id: '8b2f9f98-9b77-423b-944e-b32d2f5d99e1',
        status: 'PRESENT',
        remarks: 'Late by 5 minutes'
      }
    }
  }})
  @ApiResponse({ status: 201, description: 'Attendance created', type: CreateAttendanceDto })
  @ApiResponse({ status: 400, description: 'Validation error', schema: { example: { message: 'lessonId, studentId va status majburiy!' }}})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({
    status: 200,
    description: 'Attendance list',
    schema: {
      example: [
        {
          attendance_id: '1a2b3c4d',
          student_id: 'string',
          lesson_id: 'string',
          status: 'PRESENT',
          remarks: 'string',
          created_at: '2025-04-16T14:00:00.000Z',
          updated_at: '2025-04-16T14:00:00.000Z',
          student: { user_id: 'string', username: 'string' },
          lesson: { lesson_id: 'string', topic: 'string' }
        }
      ]
    }
  })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by id' })
  @ApiResponse({
    status: 200,
    description: 'Attendance by ID',
    schema: {
      example: {
        attendance_id: '1a2b3c4d',
        student_id: 'string',
        lesson_id: 'string',
        status: 'ABSENT',
        remarks: 'string',
        created_at: '2025-04-16T14:00:00.000Z',
        updated_at: '2025-04-16T14:00:00.000Z',
        student: { user_id: 'string', username: 'string' },
        lesson: { lesson_id: 'string', topic: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Attendance record with ID ... not found' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Put(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Update attendance record' })
  @ApiBody({ type: UpdateAttendanceDto, examples: {
    default: {
      value: {
        status: 'LATE',
        remarks: 'Was late by 10 min'
      }
    }
  }})
  @ApiResponse({ status: 200, description: 'Attendance updated', type: CreateAttendanceDto })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance deleted' })
  @ApiResponse({ status: 404, description: 'Attendance record with ID ... not found' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
