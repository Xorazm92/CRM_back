// user.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/rbac/guards/permission.guard';
import { ResourceOwnerGuard } from 'src/common/rbac/guards/resource-owner.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationPipe, UsePipes, BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';
import { Public } from 'src/common/decorator/auth.decorator';
import {
  CanReadUsers,
  CanCreateUsers,
  CanUpdateUsers,
  CanDeleteUsers,
  RequirePermissions
} from 'src/common/rbac/decorators/permissions.decorator';
import { RequireUserOwnership } from 'src/common/rbac/decorators/resource-owner.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @CanCreateUsers()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @CanReadUsers()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.filterUsers(role, status, search, Number(page), Number(limit));
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getProfile(@Req() req: Request) {
    // req.user.id yoki req.user.user_id
    return this.userService.findOne((req as any).user.user_id || (req as any).user.id);
  }

  @Get(':id')
  @UseGuards(ResourceOwnerGuard)
  @RequireUserOwnership('id')
  @CanReadUsers()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this user' })
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('filter')
  @CanReadUsers()
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
  @UseGuards(ResourceOwnerGuard)
  @RequireUserOwnership('id')
  @CanUpdateUsers()
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
  @UseGuards(ResourceOwnerGuard)
  @RequireUserOwnership('id')
  @CanUpdateUsers()
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
  @CanDeleteUsers()
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