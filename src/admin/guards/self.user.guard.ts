import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SelfUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    console.log('req', req.user);

    if (String(req.user.id) != req.params.id) {
      throw new ForbiddenException({
        message: 'Ruxsat etilmagan user',
      });
    }

    if (req.user.is_active === false) {
      throw new ForbiddenException({
        message: 'Ruxsat etilmagan user',
      });
    }
    return true;
  }
}
