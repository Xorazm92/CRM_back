import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { SignUpAuthDto } from "src/auth/dto";
import { UserService } from './user.service';


@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() signUpDto: SignUpAuthDto) {
    return this.userService.create(signUpDto);
  }

  @SkipThrottle()
  @Get()
  findAll(@Query('skip') skip: string, @Query('take') take: string) {
    return this.userService.findAll(take, skip);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
