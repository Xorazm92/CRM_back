import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../admin/dto/auth.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorator/auth.decorator';
import { UserID } from 'src/common/decorator';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { ValidationPipe, UsePipes, BadRequestException, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Public()
  // @Post('register')
  // @ApiOperation({ summary: 'Register a new user' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'User successfully registered',
  // })
  // @ApiResponse({
  //   status: HttpStatus.CONFLICT,
  //   description: 'Username already exists',
  // })
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async register(@Body() registerDto: RegisterDto) {
  //   try {
  //     return await this.authService.register(registerDto);
  //   } catch (e) {
  //     if (e instanceof ConflictException) throw e;
  //     throw new BadRequestException(e.message);
  //   }
  // }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    try {
      const { user, accessToken, refreshToken, access_token_expire, refresh_token_expire } = await this.authService.login(loginDto);
      return {
        accessToken,
        refreshToken,
        user,
        access_token_expire,
        refresh_token_expire
      };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  @ApiOperation({
    summary: 'Confirm Password User ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Confirm Password  successfully',
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'success',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Old Password invalid',
    schema: {
      example: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Old Password invalid',
      },
    },
  })
  @ApiBearerAuth()
  @Post('confirmPassword')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async confirmPassword(
    @UserID() id: string,
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ) {
    try {
      return await this.authService.confirmPassword(id, confirmPasswordDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user info',
  })
  async me(@UserID() id: string) {
    return this.authService.me(id);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token successfully refreshed',
  })
  async refreshTokens(@UserID() id: string) {
    try {
      return await this.authService.refreshTokens(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
