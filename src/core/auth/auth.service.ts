
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CustomJwtService } from '../../infrastructure/lib/custom-jwt/custom-jwt.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { BcryptEncryption } from '../../infrastructure/lib/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: CustomJwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await BcryptEncryption.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    const tokens = await this.jwtService.generateTokens(user);
    
    return {
      tokens,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      }
    };
  }
}
