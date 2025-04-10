import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { UserID } from 'src/common/decorator';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create new student' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Student created successfully',
    schema: {
      example: {
        status: HttpStatus.CREATED,
        message: 'CREATED',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'A user with this username already exists',
    schema: {
      example: {
        status: HttpStatus.BAD_REQUEST,
        message: 'A user with this username already exists',
      },
    },
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Students retrieved successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: [
          {
            user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
            full_name: 'Jhon Doe',
            username: 'jhondoe007',
            password: '$2b$10$examplepasswordhash',
            role: 'STUDENT',
            created_at: '2025-04-06T15:25:06.746Z',
            updated_at: '2025-04-06T15:25:06.746Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No students found',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.studentService.findAll(page, limit);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get profile of currently logged-in student' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: {
          user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
          full_name: 'Jhon Doe',
          username: 'jhondoe007',
        },
      },
    },
  })
  getProfile(@UserID() id: string) {
    return this.studentService.getProfile(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student retrieved successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: {
          user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
          full_name: 'Jhon Doe',
          username: 'jhondoe007',
          password: '$2b$10$examplepasswordhash',
          role: 'STUDENT',
          created_at: '2025-04-06T15:25:06.746Z',
          updated_at: '2025-04-06T15:25:06.746Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })

  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student details' })
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student updated successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'UPDATED',
        data: {
          user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
          full_name: 'John Smith',
          username: 'johnsmith123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a student' })
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student deleted successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'DELETED',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}
