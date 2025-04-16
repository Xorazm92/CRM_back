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
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './create-lesson.dto';
import { UpdateLessonDto } from './update-lesson.dto';
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
import { Public } from 'src/common';

@ApiTags('Lesson Api')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Public()
@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @ApiOperation({ summary: 'Create lesson' })
  @ApiResponse({
    status: 201,
    description: 'Lesson created',
    schema: {
      example: {
        status: 201,
        message: 'Lesson created',
        data: {
          lesson_id: 'e2b5c1f2-6c8a-4f7c-9be5-3e8e2b5c1f2a',
          topic: 'Introduction to Algebra',
          description: 'Basic algebraic concepts',
          created_at: '2025-04-16T11:51:00.000Z',
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: 'Topic is required',
        error: 'Bad Request',
      }
    }
  })
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @Post()
  async create(@Body() createLessonDto: CreateLessonDto) {
    try {
      return await this.lessonService.create(createLessonDto);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get all lessons' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons',
    schema: {
      example: {
        status: 200,
        message: 'success',
        data: [
          {
            lesson_id: 'e2b5c1f2-6c8a-4f7c-9be5-3e8e2b5c1f2a',
            topic: 'Introduction to Algebra',
            description: 'Basic algebraic concepts',
            created_at: '2025-04-16T11:51:00.000Z',
          }
        ]
      }
    }
  })
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @Get()
  async findAll() {
    try {
      return await this.lessonService.findAll();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Lesson ID', example: 'e2b5c1f2-6c8a-4f7c-9be5-3e8e2b5c1f2a' })
  @ApiResponse({
    status: 200,
    description: 'Lesson found',
    schema: {
      example: {
        status: 200,
        message: 'success',
        data: {
          lesson_id: 'e2b5c1f2-6c8a-4f7c-9be5-3e8e2b5c1f2a',
          topic: 'Introduction to Algebra',
          description: 'Basic algebraic concepts',
          created_at: '2025-04-16T11:51:00.000Z',
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Lesson not found',
        error: 'Not Found',
      }
    }
  })
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.lessonService.findOne(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Update lesson' })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated',
    schema: {
      example: {
        status: 200,
        message: 'Lesson updated',
        data: {
          lesson_id: 'e2b5c1f2-6c8a-4f7c-9be5-3e8e2b5c1f2a',
          topic: 'Updated topic',
          description: 'Updated description',
          updated_at: '2025-04-16T11:51:00.000Z',
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Lesson not found',
        error: 'Not Found',
      }
    }
  })
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    try {
      return await this.lessonService.update(id, updateLessonDto);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Delete lesson' })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted',
    schema: {
      example: {
        status: 200,
        message: 'Lesson deleted',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Lesson not found',
        error: 'Not Found',
      }
    }
  })
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.lessonService.remove(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}
