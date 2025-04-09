import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getGeneralStats() {
    return this.dashboardService.getGeneralStats();
  }

  @Get('attendance-stats')
  getAttendanceStats() {
    return this.dashboardService.getAttendanceStats();
  }

  @Get('groups-stats')
  getGroupsStats() {
    return this.dashboardService.getGroupsStats();
  }

  @Get('teachers-stats')
  getTeachersStats() {
    return this.dashboardService.getTeachersStats();
  }
}
