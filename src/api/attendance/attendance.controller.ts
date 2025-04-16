import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Create attendance record' })
  create(@Body() createAttendanceDto: any) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by id' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Put(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Update attendance record' })
  update(@Param('id') id: string, @Body() updateAttendanceDto: any) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Delete attendance record' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
