import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Cookiegetter } from '../decorators/cookie_getter.decorator';

import { LoginAdminDto } from './dto/login-participant.dto';
import { creatorGuard } from './guards/admin.creator.guard';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // @UseGuards(creatorGuard)
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Post('login')
  signIn(
    @Body() loginAdminDto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.signIn(loginAdminDto, res);
  }

  @UseGuards(AdminGuard)
  @Post('logout')
  logout(
    @Cookiegetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.logout(refreshToken, res);
  }

  @UseGuards(creatorGuard)
  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }
}
