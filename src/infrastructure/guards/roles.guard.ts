import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    // DEBUG LOG
    console.log('RolesGuard check:', {
      requiredRoles,
      userRole: user && user.role,
    });
    if (!user || !user.role) return false;

    // SUPERADMIN har doim ruxsatli
    if (String(user.role).toLowerCase() === 'superadmin') return true;

    return requiredRoles.some(
      (role) => String(user.role).toLowerCase() === String(role).toLowerCase()
    );
  }
}
