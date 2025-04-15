import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { SignInAdminDto } from './dto/signin-admin.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorator/auth.decorator';
import { AddMemberDto } from './dto/add-memberdto';
import { UserID } from 'src/common/decorator';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';

@ApiTags('Admin Api')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'Signin Admin',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin in successfully',
    schema: {
      example: {
        status_code: HttpStatus.OK,
        message: 'success',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpZCI6IjRkMGJ',
          access_token_expire: '24h',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpZCI6IjRkMGJ',
          refresh_token_expire: '15d',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed signing Admin',
    schema: {
      example: {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Invalid username or password',
      },
    },
  })
  @Public()
  @Post('signin')
  signin(@Body() signinAdminDto: SignInAdminDto) {
    return this.adminService.signin(signinAdminDto);
  }

  @ApiOperation({
    summary: 'Create Admin ',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin created',
    schema: {
      example: {
        status: HttpStatus.CREATED,
        message: 'CREATED',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'A user with this username already exists',
    schema: {
      example: {
        status: HttpStatus.BAD_REQUEST,
        message: 'A user with this username already exists',
      },
    },
  })
  @Post('createAdmin')
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @ApiOperation({
    summary: 'Add Member',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Add Members successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Members Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Members or Group with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  @Post('addMembersToGroup')
  addMembersToGroup(@Body() addMembersDto: AddMemberDto) {
    return this.adminService.addMemberToGroup(addMembersDto);
  }

  @ApiOperation({
    summary: 'Get all admins',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All admins fetched successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: [
          {
            user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
            full_name: 'Talant',
            username: 'talant007',
            password:
              '$2b$10$D01/2P0O1TI5Jg4hRglByOEwavU3cfLcLAbimHCgIn1VUXo0ZKN4W',
            role: 'ADMIN',
            created_at: '2025-04-06T15:25:06.746Z',
            updated_at: '2025-04-06T15:25:06.746Z',
          },
        ],
      },
    },
  })
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get Profile Admin ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile Admin fetched successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: [
          {
            user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
            full_name: 'Jhon Doe',
            username: 'jhondoe007',
          },
        ],
      },
    },
  })
  @Get('getProfile')
  getProfile(@UserID() id: string) {
    return this.adminService.getProfile(id);
  }

  @ApiOperation({
    summary: 'Get admin by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the admin',
    type: String,
    example: 'ws783241-213dsbzcxfdsh0329-ljdsk',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin fetched by id successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
        data: {
          user_id: 'f6bb055d-8b0b-4503-b53b-67c1230993f7',
          full_name: 'Talant',
          username: 'talant007',
          password:
            '$2b$10$D01/2P0O1TI5Jg4hRglByOEwavU3cfLcLAbimHCgIn1VUXo0ZKN4W',
          role: 'ADMIN',
          created_at: '2025-04-06T15:25:06.746Z',
          updated_at: '2025-04-06T15:25:06.746Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Admin with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @ApiOperation({
    summary: 'Edit Profile Admin ',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin Updated successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Admin with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(id, updateAdminDto);
  }

  @ApiOperation({
    summary: 'Delete Admin ',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin delete successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin Not Found',
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        message: 'Admin with id 2378askjdh-23498sjkdafh not found.',
      },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
