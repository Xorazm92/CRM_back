import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { GroupService } from './group.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UpdateGroupDto } from './dto/update.group.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ValidationPipe, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

@ApiTags('Groups') // Group API documentation tag
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create new group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New group created successfully',
    schema: {
      example: {
        status: HttpStatus.CREATED,
        message: 'New group created',
        data: {
          group_id: 'uuid-example',
          name: 'N14',
          description: 'Advanced programming group',
          course_id: 'course-uuid-example',
          created_at: '2025-04-10T05:42:33.401Z',
          updated_at: '2025-04-10T05:42:33.401Z'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group with this name already exists'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    try {
      return await this.groupService.createGroup(createGroupDto);
    } catch (e) {
      if (e.code === 'P2002') throw new ConflictException('Group with this name already exists');
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups for the admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Groups retrieved successfully',
    type: [CreateGroupDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No groups found for this admin',
  })
  async getAllGroups() {
    try {
      const result = await this.groupService.findAllGroup();
      // result = { status, message, data }
      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new NotFoundException('No groups found for this admin');
      }
      return result;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group details retrieved successfully',
    type: CreateGroupDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  async getOneGroup(@Param('id') groupId: string) {
    try {
      const group = await this.groupService.findOneGroup(groupId);
      if (!group) throw new NotFoundException('Group not found');
      return group;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update group details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group updated successfully',
    type: UpdateGroupDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group name already exists',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateGroup(
    @Param('id') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    try {
      return await this.groupService.updateOne(groupId, updateGroupDto);
    } catch (e) {
      if (e.code === 'P2002') throw new ConflictException('Group name already exists');
      if (e.code === 'P2025') throw new NotFoundException('Group not found');
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  async deleteOne(@Param('id') groupId: string) {
    try {
      return await this.groupService.remove(groupId);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
