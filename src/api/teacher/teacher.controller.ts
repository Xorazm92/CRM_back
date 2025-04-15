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
import { AdminGuard } from 'src/common/guard/admin.guard';
import { UserID } from 'src/common/decorator';

@ApiTags('Teacher Api')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @ApiOperation({
    summary: 'Create Teacher',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Teacher created successfully',
    schema: {
      example: {
        status: HttpStatus.CREATED,
        message: 'created',
      },
    },
  })
  @Post('createTeacher')
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @ApiOperation({
    summary: 'Get all Teachers',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All Teachers fetched successfully',
  })
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.teacherService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get Teacher Profile',
  })
  @Get('getProfile')
  getProfile(@UserID() id: string) {
    return this.teacherService.getProfile(id);
  }

  @ApiOperation({
    summary: 'Get Teacher by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update Teacher',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @ApiOperation({
    summary: 'Delete Teacher',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }
}