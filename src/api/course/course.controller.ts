import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Query,
  DefaultValuePipe,
  ParseIntPipe
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/guards/roles.guard';
import { Roles } from 'src/infrastructure/decorators/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Course Api')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiOperation({ summary: 'Create course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Roles('admin')
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    try {
      return await this.courseService.create(createCourseDto);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  @Roles('admin', 'teacher')
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page?: number,
    @Query('limit', new DefaultValuePipe(10)) limit?: number,
  ) {
    try {
      return await this.courseService.findAll(page, limit);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Roles('admin', 'teacher')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.courseService.findOne(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    try {
      return await this.courseService.update(id, updateCourseDto);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.courseService.remove(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get all groups for a course' })
  @ApiResponse({ status: 200, description: 'Return all groups for the course.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  @Roles('admin', 'teacher')
  @Get(':id/groups')
  async getCourseGroups(@Param('id') id: string) {
    try {
      return await this.courseService.getCourseGroups(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}
