import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FindCoursesQueryDto } from './dto/find-courses-query.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

// Kurslarni boshqarish API
@ApiTags('Kurslar boshqaruvi') // Swagger tagi qo'shildi
@ApiBearerAuth()
@Controller('courses') // Controller nomi o'zgartirildi
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Yangi kurs yaratish' }) // Uzbekcha sharh
  @ApiResponse({ status: 201, description: 'Kurs muvaffaqiyatli yaratildi.' })
  @ApiResponse({ status: 400, description: 'Noto'g'ri so'rov.' })
  @ApiResponse({ status: 401, description: 'Ruxsat etilmagan.' })
  @ApiResponse({ status: 403, description: 'Taqiqlangan. Admin huquqi talab etiladi.' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kurslarni olish' }) // Uzbekcha sharh
  @ApiResponse({ status: 200, description: 'Barcha kurslar qaytariladi.' })
  @ApiResponse({ status: 401, description: 'Ruxsat etilmagan.' })
  findAll(@Query() query: FindCoursesQueryDto) {
    return this.courseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo'yicha kursni olish' }) // Uzbekcha sharh
  @ApiResponse({ status: 200, description: 'Kurs qaytariladi.' })
  @ApiResponse({ status: 404, description: 'Kurs topilmadi.' })
  @ApiResponse({ status: 401, description: 'Ruxsat etilmagan.' })
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kursni yangilash' }) // Uzbekcha sharh
  @ApiResponse({ status: 200, description: 'Kurs muvaffaqiyatli yangilandi.' })
  @ApiResponse({ status: 404, description: 'Kurs topilmadi.' })
  @ApiResponse({ status: 401, description: 'Ruxsat etilmagan.' })
  @ApiResponse({ status: 403, description: 'Taqiqlangan. Admin huquqi talab etiladi.' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kursni o\'chirish' }) // Uzbekcha sharh
  @ApiResponse({ status: 200, description: 'Kurs muvaffaqiyatli o\'chirildi.' })
  @ApiResponse({ status: 404, description: 'Kurs topilmadi.' })
  @ApiResponse({ status: 401, description: 'Ruxsat etilmagan.' })
  @ApiResponse({ status: 403, description: 'Taqiqlangan. Admin huquqi talab etiladi.' })
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Kursga tegishli barcha guruhlarni olish' }) // Uzbekcha sharh
  @ApiResponse({ status: 200, description: 'Kursga tegishli barcha guruhlar qaytariladi.' })
  @ApiResponse({ status: 404, description: 'Kurs topilmadi.' })
  @ApiResponse({ status: 401, description: 'Ruxsat etilmagan.' })
  getCourseGroups(@Param('id') id: string) {
    return this.courseService.getCourseGroups(id);
  }
}