import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Schedule')
@Controller('/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({ status: 200, description: 'All schedules returned' })
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Schedule UUID' })
  @ApiResponse({ status: 200, description: 'Schedule by ID returned' })
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiBody({ type: Object, description: 'Schedule DTO' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  async create(@Body() dto: any) {
    return this.scheduleService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update schedule by ID' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Schedule UUID' })
  @ApiBody({ type: Object, description: 'Schedule DTO' })
  @ApiResponse({ status: 200, description: 'Schedule updated' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.scheduleService.update(id, dto);
  }

  @Post('/generate/:courseId')
  @ApiOperation({ summary: 'Generate schedule for a course', description: 'Automate schedule generation based on course syllabus, start date, lessons per week, and days of week.' })
  @ApiParam({ name: 'courseId', type: String, required: true, description: 'Course UUID' })
  @ApiBody({ schema: { example: { start_date: '2025-05-12', lessons_per_week: 3, days_of_week: [1,3,5] } } })
  @ApiResponse({ status: 201, description: 'Schedule generated for course' })
  async generateSchedule(
    @Param('courseId') courseId: string,
    @Body() dto: { start_date: string, lessons_per_week: number, days_of_week: number[] }
  ) {
    return this.scheduleService.generateSchedule(courseId, dto);
  }


}
