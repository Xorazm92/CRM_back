import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ValidationPipe, UsePipes, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new assignment' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createAssignmentDto: CreateAssignmentDto) {
    try {
      return await this.assignmentsService.create(createAssignmentDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all assignments' })
  async findAll() {
    try {
      return await this.assignmentsService.findAll();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by id' })
  async findOne(@Param('id') id: string) {
    try {
      const assignment = await this.assignmentsService.findOne(id);
      if (!assignment) throw new NotFoundException('Assignment not found');
      return assignment;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update assignment' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    try {
      return await this.assignmentsService.update(id, updateAssignmentDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete assignment' })
  async remove(@Param('id') id: string) {
    try {
      return await this.assignmentsService.remove(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
