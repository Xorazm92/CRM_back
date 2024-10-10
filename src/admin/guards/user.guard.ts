import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.cookie;
    console.log(req.headers);
    if (!authHeader) {
      throw new UnauthorizedException(`Invalid authorization1`);
    }
    const token = req.cookies["refresh_token"]
    console.log(token)
    if (!token) {
      throw new UnauthorizedException(`Invalid authorization2`);
    }

    async function verify(token: string, jwtService: JwtService) {
      let user: any;
      try {
        user = await jwtService.verify(token, {
          secret: process.env.REFRESH_TOKEN_KEY,
        });
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      if (!user) {
        throw new UnauthorizedException('User not verified');
      }
      if (!user.is_active) {
        throw new BadRequestException('User is not active');
      }
      req.user = user;
      return true;
    }
    return verify(token, this.jwtService);
  }
}
