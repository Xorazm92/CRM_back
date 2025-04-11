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
  NotFoundException,
  Injectable,
  Put,
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
import { GroupMembers } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@ApiTags('group-members')
@Controller('group-members')
export class GroupMembersController {
  prisma: any;
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all group members' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    return this.groupMembersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group member by ID' })
  async findOne(id: string): Promise<GroupMembers> {
    const member = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
      include: {
        user: true,
        group: true,
      },
    });
  
    if (!member) {
      throw new NotFoundException('Group member not found');
    }
  
    return member; // To'g'ri formatda qaytariladi
  }

  @Post()
  @ApiOperation({ summary: 'Create new group member' })
  async create(createGroupMemberDto: CreateGroupMemberDto): Promise<GroupMembers> {
    return this.prisma.groupMembers.create({
      data: {
        group_id: createGroupMemberDto.groupId,
        user_id: createGroupMemberDto.userId,
      },
      include: {
        user: true,
        group: true,
      },
    });
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update group member' })
  async update(id: string, updateGroupMemberDto: UpdateGroupMemberDto): Promise<GroupMembers> {
    const member = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
    });
    if (!member) {
      throw new NotFoundException('Group member not found');
    }
  
    return this.prisma.groupMembers.update({
      where: { group_members_id: id },
      data: {
        group_id: updateGroupMemberDto.groupId,
        user_id: updateGroupMemberDto.userId,
      },
      include: {
        user: true,
        group: true,
      },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group member' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.groupMembersService.remove(id);
    return;
  }
}

// group-members.service.ts
@Injectable()
export class groupMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<{ group_members_id: string; group_id: string; user_id: string; created_at: Date; updated_at: Date; }[]> {
    return this.prisma.groupMembers.findMany({
      include: {
        user: true,
        group: true,
      },
    });
  }

  async findOne(id: string): Promise<GroupMembers> {
    const member = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
      include: {
        user: true,
        group: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Group member not found');
    }

    return member;
  }

  async create(createGroupMemberDto: CreateGroupMemberDto): Promise<GroupMembers> {
    return this.prisma.groupMembers.create({
      data: {
        group_id: createGroupMemberDto.groupId,
        user_id: createGroupMemberDto.userId,
      },
      include: {
        user: true,
        group: true,
      },
    });
  }

  async update(id: string, updateGroupMemberDto: UpdateGroupMemberDto): Promise<GroupMembers> {
    const member = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
    });
    if (!member) {
      throw new NotFoundException('Group member not found');
    }

    return this.prisma.groupMembers.update({
      where: { group_members_id: id },
      data: {
        group_id: updateGroupMemberDto.groupId,
        user_id: updateGroupMemberDto.userId,
      },
      include: {
        user: true,
        group: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const member = await this.prisma.groupMembers.findUnique({
      where: { group_members_id: id },
    });
    if (!member) {
      throw new NotFoundException('Group member not found');
    }
    await this.prisma.groupMembers.delete({
      where: { group_members_id: id },
    });
  }
}