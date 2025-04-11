import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TeacherGuard } from 'src/common/guard/teacher.guard';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { UserID } from 'src/common/decorator';

@ApiTags('Teacher Api')
@ApiBearerAuth()
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create Teacher' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Teacher created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'A user with this username already exists',
  })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teachers retrieved successfully',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.teacherService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update teacher' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete teacher' })
  @ApiParam({ name: 'id', description: 'Teacher ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }

  @Get('getProfile')
  @UseGuards(TeacherGuard)
  @ApiOperation({ summary: 'Get Profile Teacher ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile Teacher fetched successfully',
  })
  getProfile(@UserID() id: string) {
    return this.teacherService.getProfile(id);
  }

  @Get('groups')
  @UseGuards(TeacherGuard)
  @ApiOperation({ summary: 'Get teacher groups' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher groups retrieved successfully',
  })
  getTeacherGroups(@UserID() userId: string) {
    return this.teacherService.getTeacherGroups(userId);
  }

  @Get('lessons')
  @UseGuards(TeacherGuard)
  @ApiOperation({ summary: 'Get teacher lessons' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher lessons retrieved successfully',
  })
  getTeacherLessons(@UserID() userId: string) {
    return this.teacherService.getTeacherLessons(userId);
  }
}
