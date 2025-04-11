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
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'A user with this username already exists',
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Students retrieved successfully',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.studentService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }

  @Get('profile')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get student profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student profile retrieved successfully',
  })
  getProfile(@UserID() userId: string) {
    return this.studentService.getProfile(userId);
  }

  @Get('groups')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get student groups' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student groups retrieved successfully',
  })
  getStudentGroups(@UserID() userId: string) {
    return this.studentService.getStudentGroups(userId);
  }

  @Get('lessons')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get student lessons' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student lessons retrieved successfully',
  })
  getStudentLessons(@UserID() userId: string) {
    return this.studentService.getStudentLessons(userId);
  }
}
