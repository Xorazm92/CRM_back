import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson' })
  create(@Body() createLessonDto: any) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons' })
  findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by id' })
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update lesson' })
  update(@Param('id') id: string, @Body() updateLessonDto: any) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete lesson' })
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }
}
