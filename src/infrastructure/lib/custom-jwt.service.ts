import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../users/user-role.enum';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class CustomJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify(token);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify(token);
  }

  async decode(token: string) {
    return this.jwtService.decode(token);
  }
}
