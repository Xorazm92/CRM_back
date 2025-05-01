import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, Req } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles('student', 'STUDENT')
  @ApiOperation({ summary: 'Submit assignment answer' })
  @ApiBody({ type: CreateSubmissionDto, examples: {
    default: {
      value: {
        assignment_id: 'uuid-assignment',
        file_path: '/uploads/hw1.pdf',
        answer_text: 'My answer'
      }
    }
  }})
  @ApiResponse({ status: 201, description: 'Submission created', type: CreateSubmissionDto })
  @ApiResponse({ status: 400, description: 'You have already submitted for this assignment!' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Req() req, @Body() createSubmissionDto: CreateSubmissionDto) {
    try {
      // student_id ni token (req.user) dan olish
      const student_id = req.user?.user_id;
      if (!student_id) {
        throw new BadRequestException('student_id aniqlanmadi! Iltimos, qayta login qiling.');
      }
      return await this.submissionsService.create({
        ...createSubmissionDto,
        student_id,
      });
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

  @Get('assignment/:assignmentId')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  @ApiResponse({ status: 200, description: 'List of submissions for an assignment', schema: { example: [
    {
      submission_id: 'sub1',
      assignment_id: 'a1',
      student_id: 's1',
      file_path: '/uploads/hw1.pdf',
      answer_text: 'My answer',
      grade: 'A',
      feedback: 'Good job',
      graded_by: 'teacher1',
      created_at: '2025-04-16T14:00:00.000Z',
      updated_at: '2025-04-16T14:00:00.000Z',
      assignment: { title: 'HW1' },
      student: { user_id: 's1', full_name: 'Student 1' },
      graded: { user_id: 't1', full_name: 'Teacher 1' }
    }
  ] } })
  async getSubmissionsByAssignment(@Param('assignmentId') assignmentId: string) {
    return this.submissionsService.getByAssignment(assignmentId);
  }

  @Put(':id')
  @Roles('teacher', 'TEACHER', 'admin', 'ADMIN')
  @ApiOperation({ summary: 'Grade submission' })
  @ApiBody({ type: UpdateSubmissionDto, examples: {
    default: {
      value: {
        grade: 'A',
        feedback: 'Excellent work!',
        graded_by: 'uuid-teacher'
      }
    }
  }})
  @ApiResponse({ status: 200, description: 'Submission graded', type: UpdateSubmissionDto })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
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
