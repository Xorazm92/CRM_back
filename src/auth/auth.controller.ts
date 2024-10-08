import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { AuthService } from './auth.service';
import { SignInAuthDto } from "./dto";
import { SignUpAuthDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from "./guard/jwt-auth.guard";

interface Request { user: any }


@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @ApiBody({ type: SignUpAuthDto })
  singup(@Body() singUpAuthDto: SignUpAuthDto) {
    return this.authService.singUp(singUpAuthDto);
  }

  @Post('signin')
  singin(@Body() singInAuthDto: SignInAuthDto) {
    return this.authService.singIn(singInAuthDto);

  }

  @Get('me')
  // @UseGuards(AuthGuard)
  @UseGuards(JwtAuthGuard)
  getme(@Req() req: Request) {
    return req.user
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }


}
