import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/guards/roles.guard';
import { Roles } from 'src/infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AgeStatsDto } from './dto/age-stats.dto';

@ApiTags('Dashboard Api')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get general statistics' })
  @ApiResponse({ status: 200, description: 'General dashboard statistics' })
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
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
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
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
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER', 'teacher', 'TEACHER')
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
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
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
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
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

  @ApiOperation({ summary: 'Bolalarni yosh bo‘yicha statistikasi' })
  @ApiResponse({ status: 200, description: 'Yosh bo‘yicha statistik ma’lumotlar', type: [AgeStatsDto] })
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @Get('students/age-stats')
  async getStudentAgeStats() {
    return this.dashboardService.getStudentAgeStats();
  }

  @ApiOperation({ summary: 'So‘nggi to‘lovlar' })
  @ApiResponse({ status: 200, description: 'Oxirgi 5 ta to‘lov', type: Object })
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @Get('recent-payments')
  async getRecentPayments() {
    return this.dashboardService.getRecentPayments();
  }

  @ApiOperation({ summary: 'Kirim statistikasi' })
  @ApiResponse({ status: 200, description: 'Kirim statistikasi', type: Object })
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @Get('stats/income')
  async getIncomeStats() {
    return this.dashboardService.getIncomeStats();
  }

  @ApiOperation({ summary: 'Bolalar soni o‘zgarishi' })
  @ApiResponse({ status: 200, description: 'Bolalar soni o‘zgarishi', type: Object })
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @Get('stats/student-delta')
  async getStudentCountDelta() {
    return this.dashboardService.getStudentCountDelta();
  }
}
