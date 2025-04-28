import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../enum';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('ADMIN GUARD req.user:', req.user); // DEBUG
    // ADMIN yoki SUPERADMIN ham kirishi mumkin
    const role = req.user?.role?.toUpperCase();
    if (!role || (role !== 'ADMIN' && role !== 'SUPERADMIN')) {
      throw new ForbiddenException('Forbidden user');
    }
    return true;
  }
}
