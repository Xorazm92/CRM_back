import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../enum';

@Injectable()
export class SelfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.user?.role || req.user?.role === UserRole.ADMIN) {
      return true;
    }
    if (req.params.id !== req.user.id) {
      throw new ForbiddenException('Forbidden user');
    }
    return true;
  }
}
