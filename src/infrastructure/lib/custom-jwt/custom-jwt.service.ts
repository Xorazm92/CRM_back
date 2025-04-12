import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { $Enums } from '@prisma/client';

@Injectable()
export class CustomJwtService {
  verifyAccessToken(token: any): any {
    throw new Error('Method not implemented.');
  }
  generateRefreshToken(payload: { id: string; sub: string; role: $Enums.UserRole; }) {
    throw new Error('Method not implemented.');
  }
  generateAccessToken(payload: { id: string; sub: string; role: $Enums.UserRole; }) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verify(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }

  async decode(token: string): Promise<any> {
    return this.jwtService.decode(token);
  }
}