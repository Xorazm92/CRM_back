import {
  Controller,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/guards/roles.guard';
import { Roles } from 'src/infrastructure/decorators/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Dashboard Api')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get general statistics' })
  @ApiResponse({ status: 200, description: 'General dashboard statistics' })
  @Roles('admin', 'manager')
  @Get('stats')
  async getStats() {
    try {
      return await this.dashboardService.getStats();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get financial statistics' })
  @ApiResponse({ status: 200, description: 'Financial statistics' })
  @Roles('admin', 'manager')
  @Get('financial')
  async getFinancialStats() {
    try {
      return await this.dashboardService.getFinancialStats();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({ status: 200, description: 'Attendance statistics' })
  @Roles('admin', 'manager', 'teacher')
  @Get('attendance')
  async getAttendanceStats() {
    try {
      return await this.dashboardService.getAttendanceStats();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get groups statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics about groups including total active groups and group performance.',
  })
  @Roles('admin', 'manager')
  @Get('groups')
  async getGroups() {
    try {
      const stats = await this.dashboardService.getStats();
      return {
        activeGroups: stats.activeGroups,
        lastUpdated: stats.lastUpdated,
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get teachers statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics about teachers including total teachers and teacher performance.',
  })
  @Roles('admin', 'manager')
  @Get('teachers')
  async getTeachers() {
    try {
      const stats = await this.dashboardService.getStats();
      return {
        totalTeachers: stats.totalTeachers,
        teacherPerformance: stats.teacherPerformance,
        lastUpdated: stats.lastUpdated,
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
