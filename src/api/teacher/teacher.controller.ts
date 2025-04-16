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
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
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

@ApiTags('Teacher Api')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @ApiOperation({ summary: 'Create teacher' })
  @ApiResponse({ status: 201, description: 'Teacher created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Roles('admin', 'ADMIN')
  @Post()
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    try {
      return await this.teacherService.create(createTeacherDto);
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'List of teachers' })
  @Roles('admin', 'ADMIN')
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    try {
      return await this.teacherService.findAll(page, limit);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get teacher profile' })
  @ApiResponse({ status: 200, description: 'Teacher profile' })
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    try {
      return await this.teacherService.getProfile(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Teacher found' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @Roles('admin', 'ADMIN')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.teacherService.findOne(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Update teacher' })
  @ApiResponse({ status: 200, description: 'Teacher updated' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @Roles('admin', 'ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    try {
      return await this.teacherService.update(id, updateTeacherDto);
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  @ApiOperation({ summary: 'Delete teacher' })
  @ApiResponse({ status: 200, description: 'Teacher deleted' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @Roles('admin', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.teacherService.remove(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}