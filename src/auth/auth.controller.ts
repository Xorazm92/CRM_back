import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInAuthDto, SignUpAuthDto } from './dto';
import { Response } from 'express';

@ApiTags('Users')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/signup')
  async  signUp(
    @Body() signUpAuthDto: SignUpAuthDto,
    @Res() response: Response,
  ) {
    return await this.authService.signUp(signUpAuthDto, response);
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/signin')
  async signIn(@Body() signInAuthDto: SignInAuthDto, @Res() response: Response) {
    const result = await this.authService.signIn(signInAuthDto, response);
    return response.status(result.status).json(result.data);
  }
}
