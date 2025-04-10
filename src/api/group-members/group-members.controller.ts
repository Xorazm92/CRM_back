import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Group Members')
@ApiBearerAuth()
@Controller('group-members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new group member' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New group member created successfully',
    type: CreateGroupMemberDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or Group not found',
  })
  create(@Body() createGroupMemberDto: CreateGroupMemberDto) {
    return this.groupMembersService.create(createGroupMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all group members (paginated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group members ret`rieved successfully',
    type: [CreateGroupMemberDto],
  })
  @ApiQuery({ name: 'page', required: true, type: 'number' })
  @ApiQuery({ name: 'limit', required: true, type: 'number' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.groupMembersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one group member by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group member found',
    type: CreateGroupMemberDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group member not found',
  })
  findOne(@Param('id') id: string) {
    return this.groupMembersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group member by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group member updated successfully',
    type: UpdateGroupMemberDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group member not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateGroupMemberDto: UpdateGroupMemberDto,
  ) {
    return this.groupMembersService.update(id, updateGroupMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group member by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group member deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group member not found',
  })
  remove(@Param('id') id: string) {
    return this.groupMembersService.remove(id);
  }
}
