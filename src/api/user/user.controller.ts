// user.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ValidationPipe, UsePipes, BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';
import { Public } from 'src/common/decorator/auth.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.filterUsers(role, status, search, Number(page), Number(limit));
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getProfile(@Req() req: Request) {
    // req.user.id yoki req.user.user_id
    return this.userService.findOne((req as any).user.user_id || (req as any).user.id);
  }

  @Get('filter')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Filter users by role, status, or search' })
  @ApiResponse({ status: 200, description: 'Filtered users list' })
  @ApiQuery({ name: 'role', required: false, enum: ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'], description: 'User role to filter by' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'], description: 'User status to filter by' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, username, email, phone, etc.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Page size', type: Number })
  async filter(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.filterUsers(role, status, search, Number(page), Number(limit));
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put(':id/password')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    try {
      return await this.userService.changePassword(id, dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    try {
      return await this.userService.remove(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}