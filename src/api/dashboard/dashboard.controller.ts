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
  getGeneralStats() {
    return this.dashboardService.getGeneralStats();
  }

  @Get('attendance-stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns attendance statistics including total lessons, average attendance, and attendance by group/date.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  getAttendanceStats() {
    return this.dashboardService.getAttendanceStats();
  }

  @Get('groups-stats')
  @ApiOperation({ summary: 'Get groups statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns groups statistics including total groups, active groups, and students per group.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  getGroupsStats() {
    return this.dashboardService.getGroupsStats();
  }

  @Get('teachers-stats')
  @ApiOperation({ summary: 'Get teachers statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns teachers statistics including groups per teacher and their students.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin/Manager access required.' })
  getTeachersStats() {
    return this.dashboardService.getTeachersStats();
  }
}
