import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.ACCESS_TOKEN_TIME,
    });
  }

  async generateRefreshToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_TIME,
    });
  }

  async verifyAccessToken(token: string): Promise<any> {
    return this.jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_KEY,
    });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
  }
} 