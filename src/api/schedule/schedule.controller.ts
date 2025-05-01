import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Schedule')
@Controller('/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.scheduleService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.scheduleService.update(id, dto);
  }

  @Post('/generate/:courseId')
async generateSchedule(
  @Param('courseId') courseId: string,
  @Body() dto: { start_date: string, lessons_per_week: number, days_of_week: number[] }
) {
  return this.scheduleService.generateSchedule(courseId, dto);
}


}
