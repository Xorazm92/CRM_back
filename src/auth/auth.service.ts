import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { SignInAuthDto } from './dto/sign-in.dto';
import { SignUpAuthDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(

    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) { }


  async singUp(signUpAuthDto: SignUpAuthDto) {
    return this.userService.create(signUpAuthDto)
  }


  async singIn(signInAuthDto: SignInAuthDto): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(signInAuthDto.email)

    if (!user) {
      throw new UnauthorizedException()
    }

    const isPasswordEqueal = user.password === signInAuthDto.password
    if (!isPasswordEqueal) {
      throw new UnauthorizedException()
    }
    const payload = {
      sub: user.id,
      email: user.email,
      // name: user.name,
      // role:user.role
    }
    const token = await this.generateToken(payload)

    return { accessToken: token }
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: SignInAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  async generateToken(payload: Record<string, any>) {
    const token = await this.jwtService.signAsync(payload)
    return token
  }



  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
