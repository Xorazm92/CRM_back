import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FindCoursesQueryDto } from './dto/find-courses-query.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';


@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new course',
    description: 'Creates a new course with the provided details. Only available to ADMIN role.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Course has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request. Invalid input data.',
    schema: {
      example: {
        message: 'Validation failed',
        errors: {
          name: 'Course name is required'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. JWT token is missing or invalid.'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden. Only ADMIN can create courses.'
  })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all courses with pagination',
    description: 'Returns a paginated list of all courses. Results can be filtered and sorted.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Page number (default: 1)'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of items per page (default: 10)'
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String,
    description: 'Search term for course name'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
    description: 'Filter by course status'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of courses',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.'
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.courseService.findAll(page, limit, search, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get course by ID',
    description: 'Returns detailed information about a specific course.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns course details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course with ID [id] not found'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.'
  })
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update course',
    description: 'Updates course information. Only available to ADMIN role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Course has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course with ID [id] not found'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN can update courses.'
  })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete course',
    description: 'Deletes a course permanently. Only available to ADMIN role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Course has been successfully deleted.'
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course with ID [id] not found'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN can delete courses.'
  })
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }

  @Get(':id/groups')
  @ApiOperation({
    summary: 'Get course groups',
    description: 'Returns all groups associated with the specified course.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of groups for the course',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course with ID [id] not found'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.'
  })
  getCourseGroups(@Param('id') id: string) {
    return this.courseService.getCourseGroups(id);
  }
}
