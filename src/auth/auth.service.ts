import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id.toString(), 
      email: user.email, 
      role: user.role as UserRole 
    };
    
    const accessToken = await this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verify(refreshTokenDto.refreshToken);
      
      if (!payload || typeof payload !== 'object' || !('sub' in payload)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findOne(parseInt(payload.sub));
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { 
        sub: user.id.toString(), 
        email: user.email, 
        role: user.role as UserRole 
      };
      
      const accessToken = await this.jwtService.sign(newPayload);
      const refreshToken = await this.jwtService.sign(newPayload);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
