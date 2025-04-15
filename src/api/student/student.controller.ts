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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserID } from 'src/common/decorator';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';


@ApiTags('Student Api')
@ApiBearerAuth()
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOperation({
    summary: 'Create Student ',
  })
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
 
  @Post('createStudent')
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @ApiOperation({
    summary: 'Get all Student ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All Student fetched successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: [
          {
            user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
            full_name: 'Jhon Doe',
            username: 'jhondoe007',
            password:
              '$2b$10$D01/2P0O1TI5Jg4hRglByOEwavU3cfLcLAbimHCgIn1VUXo0ZKN4W',
            role: 'STUDENT',
            created_at: '2025-04-06T15:25:06.746Z',
            updated_at: '2025-04-06T15:25:06.746Z',
          },
        ],
      },
    },
  })
 
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.studentService.findAll(page , limit);
  }

  @ApiOperation({
    summary: 'Get Profile Student ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile Student fetched successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: [
          {
            user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
            full_name: 'Jhon Doe',
            username: 'jhondoe007',
          },
        ],
      },
    },
  })
  @Get('getProfile')
  getProfile(@UserID() id: string) {
    return this.studentService.getProfile(id);
  }

  @ApiOperation({
    summary: 'Get Student by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the Student',
    type: String,
    example: 'ws783241-213dsbzcxfdsh0329-ljdsk',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student fetched by id successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: {
          user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
          full_name: 'Jhon Doe',
          username: 'jhondoe007',
          password:
            '$2b$10$D01/2P0O1TI5Jg4hRglByOEwavU3cfLcLAbimHCgIn1VUXo0ZKN4W',
          role: 'STUDENT',
          created_at: '2025-04-06T15:25:06.746Z',
          updated_at: '2025-04-06T15:25:06.746Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Student with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Edit Profile Student ',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Student Updated successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Student with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @ApiOperation({
    summary: 'Delete Student ',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Student delete successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Student with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}
