import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { GroupService } from './group.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UserID } from 'src/common/decorator/user-id.decorator';
import { UpdateGroupDto } from './dto/update.group.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ValidationPipe, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

@ApiTags('Groups') // Group API documentation tag
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Guruh yaratish', description: 'Yangi guruh yaratadi.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Yangi guruh muvaffaqiyatli yaratildi.',
    schema: {
      example: {
        group_id: 'uuid-example',
        name: 'N14',
        description: 'Advanced programming group',
        course_id: 'course-uuid-example',
        created_at: '2025-04-10T05:42:33.401Z',
        updated_at: '2025-04-10T05:42:33.401Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Bu nomda guruh allaqachon mavjud.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto‘g‘ri ma’lumot.' })
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
  @ApiOperation({ summary: 'Barcha guruhlarni olish', description: 'Barcha guruhlarni ro‘yxatini olish.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guruhlar muvaffaqiyatli olindi.',
    type: [CreateGroupDto],
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Hech qanday guruh topilmadi.' })
  async getAllGroups() {
    try {
      const result = await this.groupService.findAllGroup();
      return result;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Guruhni ID bo‘yicha olish', description: 'Berilgan ID bo‘yicha guruh, course, teacher va group_members (user bilan) ma’lumotlarini olish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Guruh UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guruh topildi.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guruh topilmadi.' })
  async getGroup(@Param('id') id: string) {
    const group = await this.groupService.getGroupFull(id);
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  @Get(':id/full')
  @ApiOperation({ summary: 'Guruhni ID bo‘yicha olish', description: 'Berilgan ID bo‘yicha guruh, course, teacher va group_members (user bilan) ma’lumotlarini olish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Guruh UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guruh topildi.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guruh topilmadi.' })
  async getGroupFull(@Param('id') id: string) {
    return this.groupService.getGroupWithMembers(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Guruh aʼzolari roʻyxati', description: 'Berilgan ID bo‘yicha guruhga tegishli barcha aʼzolar (userlar) roʻyxatini olish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Guruh UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guruh aʼzolari roʻyxati.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guruh yoki aʼzolar topilmadi.' })
  async getGroupMembers(@Param('id') id: string) {
    const group = await this.groupService.getGroupWithMembers(id);
    if (!group || !group.group_members) throw new NotFoundException('Guruh yoki aʼzolar topilmadi.');
    // Faqat userlar roʻyxatini qaytaramiz
    return group.group_members.map((member: any) => member.user);
  }

  @Get(':id/lessons')
  @ApiOperation({ summary: 'Guruh darslari roʻyxati', description: 'Berilgan ID bo‘yicha guruhga tegishli barcha darslar (lessons) roʻyxatini olish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Guruh UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guruh darslari roʻyxati.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guruh yoki darslar topilmadi.' })
  async getGroupLessons(@Param('id') id: string) {
    // Guruh mavjudligini tekshirish
    const group = await this.groupService.findOneGroup(id);
    if (!group) throw new NotFoundException('Guruh topilmadi.');
    // Darslarni olish
    const lessons = await this.groupService.getLessonsByGroupId(id);
    // Darslar bo'lmasa ham bo'sh massiv qaytariladi
    return lessons || [];
  }

  @Put(':id')
  @ApiOperation({ summary: 'Guruhni yangilash', description: 'Berilgan ID bo‘yicha guruh ma’lumotlarini yangilash.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Guruh UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guruh yangilandi.',
    type: UpdateGroupDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guruh topilmadi.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Bu nomda guruh allaqachon mavjud.' })
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
  @ApiOperation({ summary: 'Guruhni o‘chirish', description: 'Berilgan ID bo‘yicha guruhni o‘chirish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Guruh UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guruh o‘chirildi.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guruh topilmadi.' })
  async deleteOne(@Param('id') groupId: string) {
    try {
      return await this.groupService.remove(groupId);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
