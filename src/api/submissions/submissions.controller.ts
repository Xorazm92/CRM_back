import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';

@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: 201, description: 'Submission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createSubmissionDto: CreateSubmissionDto) {
    try {
      return await this.submissionsService.create(createSubmissionDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @Roles('student', 'STUDENT', 'teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Get all submissions' })
  @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    try {
      return await this.submissionsService.findAll();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @Roles('student', 'STUDENT', 'teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Get submission by ID' })
  @ApiResponse({ status: 200, description: 'Submission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    try {
      const submission = await this.submissionsService.findOne(id);
      if (!submission) throw new NotFoundException('Submission not found');
      return submission;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Update submission' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
    try {
      return await this.submissionsService.update(id, updateSubmissionDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Delete submission' })
  @ApiResponse({ status: 200, description: 'Submission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    try {
      return await this.submissionsService.remove(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
