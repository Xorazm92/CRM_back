import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
// import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
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
    const token = req.cookies['refresh_token'];
    console.log(token);
    if (!token) {
      throw new UnauthorizedException(`Invalid authorization2`);
    }

    async function verify(token: string, jwtService: JwtService) {
      try {
        const admin = await jwtService.verify(token, {
          secret: process.env.REFRESH_TOKEN_KEY,
        });
        const dataDecoded = await jwtService.decode(token, {
          // secret: process.env.ACCESS_TOKEN_KEY,
        });
        console.log('decoded: ', dataDecoded);

        console.log(admin.hasOwnProperty('is_active'));
        if (!admin.hasOwnProperty('is_active')) {
          throw new UnauthorizedException(`Kirishga ruxsat yoq`);
        }

        if (!admin) {
          throw new UnauthorizedException(`Unuathorized admin`);
        }
        if (!admin.is_active) {
          throw new UnauthorizedException(`Admin is not active`);
        }
        console.log('admin1  ', admin);
        req.admin = admin

        return true;
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    return verify(token, this.jwtService);
  }
}
