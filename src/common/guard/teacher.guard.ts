import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../enum';

@Injectable()
export class TeacherGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log(req.user)
    if (req.user?.role === UserRole.TEACHER || req.user?.role === UserRole.ADMIN) {
      return true;
    } else {
      throw new ForbiddenException('Forbidden user');
    }
  }
}
