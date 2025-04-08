import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { GroupService } from './group.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateGroupDto } from './dto/update.group.dto';

@ApiTags('Groups') // Group API documentation tag
@Controller('groups')
export class GroupController {
  constructor(private readonly groupServer: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create new group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New group created successfully',
    type: CreateGroupDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group already exists!',
  })
  createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.groupServer.createGroup(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups for the admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Groups retrieved successfully',
    type: [CreateGroupDto], // Or whatever type represents your group
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No groups found for this admin',
  })
  getAllGroups() {
    return this.groupServer.findAllGroup();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group details retrieved successfully',
    type: CreateGroupDto, // Or the DTO type representing the group
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  getOneGroup(@Param('id') groupId: string) {
    return this.groupServer.findOneGroup(groupId);
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
  updateGroup(
    @Param('id') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupServer.updateOne(groupId, updateGroupDto);
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
  deleteOne(@Param('id') groupId: string) {
    return this.groupServer.remove(groupId);
  }
}
