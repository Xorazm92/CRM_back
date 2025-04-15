import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get general statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns general statistics including total students, teachers, groups, and courses.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns attendance statistics including total lessons, average attendance, and attendance by group/date.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  async getAttendance() {
    const stats = await this.dashboardService.getStats();
    return {
      totalStudents: stats.totalStudents,
      attendance: stats.attendance,
      lastUpdated: stats.lastUpdated
    };
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get groups statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics about groups including total active groups and group performance.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  async getGroups() {
    const stats = await this.dashboardService.getStats();
    return {
      activeGroups: stats.activeGroups,
      lastUpdated: stats.lastUpdated
    };
  }

  @Get('teachers')
  @ApiOperation({ summary: 'Get teachers statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics about teachers including total teachers and teacher performance.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  async getTeachers() {
    const stats = await this.dashboardService.getStats();
    return {
      totalTeachers: stats.totalTeachers,
      teacherPerformance: stats.teacherPerformance,
      lastUpdated: stats.lastUpdated
    };
  }
}
