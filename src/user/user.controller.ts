import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { AdminGuard } from '../admin/guards/admin.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cookiegetter } from '../decorators/cookie_getter.decorator';

@ApiTags('Users')
@Controller('User')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/register')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    return await this.userService.create(createUserDto, response);
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() response: Response) {
    const result = await this.userService.login(loginUserDto, response);
    return response.status(result.status).json(result.data);
  }

  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(AdminGuard)
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(+id);
  }
  @Post('logout')
  logout(
    @Cookiegetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.logout(refreshToken, res);
  }
}
